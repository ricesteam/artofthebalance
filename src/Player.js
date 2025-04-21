import Phaser from 'phaser';
import { BasicAttack } from './attacks/BasicAttack'; // Import BasicAttack
import { BombAttack } from './attacks/BombAttack';
import { BlackholeAttack } from './attacks/BlackholeAttack';

export class Player extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'player', 0, {
            label: 'player',
        });
        scene.add.existing(this);

        this.scene = scene;
        this.world = scene.matter.world;
        this.acceleration = 0.002;
        this.maxSpeed = 3;
        this.minSlideSpeed = 1;
        this.playerDirection = 1;
        this.isGrounded = false; // Track if the player is on the ground
        this.hp = 100;
        this.SupremeJuice = 0; // New stat: Supreme Juice

        this.setRectangle(16, 32);
        this.setMass(1);
        this.setFriction(0.2);
        this.setFrictionStatic(0.2);
        this.setFrictionAir(0);
        this.setBounce(0.5);
        this.setFixedRotation();
        this.setCollisionCategory(this.scene.CATEGORY_PLAYER);
        this.setScale(2); // Double the scale of the player sprite
        this.setDepth(5);

        this.attackArea = null;

        this.anims.play('stand');

        this.headSensor = this.scene.matter.add.circle(this.x, this.y, 15, {
            isSensor: true,
            ignoreGravity: true,
            label: 'headSensor',
        });

        // Create a constraint to keep the head sensor attached to the player's body
        this.scene.matter.add.constraint(this.body, this.headSensor, 0, 1, {
            pointA: { x: 0, y: -35 }, // Position relative to the player's body center
            pointB: { x: 0, y: 0 }, // Position relative to the head sensor's center,
            damping: 0,
            angularStiffness: 0,
        });

        // Listen for collision events to determine if the player is on the ground
        this.scene.matter.world.on(
            'collisionstart',
            this.handleCollision,
            this
        );
        this.scene.matter.world.on(
            'collisionend',
            this.handleEndCollision,
            this
        );

        var outlineconfig = {
            thickness: 2,
            //outlineColor: 0xd5e04b,
            outlineColor: 0xffffff,
            quality: 0.1,
            name: 'rexOutlinePostFx',
        };

        this.outlinePipeline = scene.plugins
            .get('rexOutlinePipeline')
            .add(this.body.gameObject, outlineconfig);

        this.inventory = []; // Array to hold attacks (stack)

        this.basicAttack = new BasicAttack(scene);
        // basicAttack is the default attack. Do not add it to the inventory for it will get removed by accident

        this.bombAttackDuration = 10000;
        this.bombAttack = new BombAttack(scene);

        this.blackholeAttackDuration = 15000;
        this.blackholeAttack = new BlackholeAttack(scene);

        // Timer for auto-attacking with the first equipped attack
        this.autoAttackTimer = this.scene.time.addEvent({
            delay: 500, // Adjust the delay as needed (e.g., 500ms for 2 attacks per second)
            callback: () => {
                this.useAttack(0); // Use the attack in the first inventory slot
            },
            callbackScope: this,
            loop: true,
        });

        // Store the original head position
        this.originalHeadPosition = { x: 0, y: 0 };

        //this.postFX.addShine(0.7, 0.2, 5);
    }

    handleCollision(event) {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            if (
                (bodyA === this.body || bodyB === this.body) &&
                (bodyA.collisionFilter.category ===
                    this.scene.CATEGORY_PLATFORM ||
                    bodyB.collisionFilter.category ===
                        this.scene.CATEGORY_PLATFORM)
            ) {
                this.isGrounded = true;
            }

            if (bodyA === this.headSensor || bodyB === this.headSensor) {
                const otherBody = bodyA === this.headSensor ? bodyB : bodyA;
                if (otherBody !== this.body && !otherBody.isSensor) {
                    const otherGameObject = otherBody.gameObject;
                    if (otherGameObject && otherGameObject.active) {
                        // Add the object to the juggledObjects array if it's not already there
                        if (
                            !this.scene.juggledObjects.includes(otherGameObject)
                        ) {
                            this.scene.juggledObjects.push(otherGameObject);
                        }

                        // lets mix in the player's velocity
                        const bounceVelocityX =
                            this.body.velocity.x *
                                Phaser.Math.FloatBetween(0, 1) + // Mix in player's horizontal velocity
                            this.playerDirection *
                                Phaser.Math.FloatBetween(0, 1); // Randomize horizontal bounce
                        const bounceVelocityY = Phaser.Math.FloatBetween(
                            -5,
                            -8
                        ); // Randomize vertical bounce
                        otherGameObject.setVelocity(
                            bounceVelocityX,
                            bounceVelocityY
                        );

                        if (typeof otherGameObject.bounce === 'function') {
                            otherGameObject.bounce();
                            this.updateSupremeJuiceFromJuggling();
                        }
                    }
                }
            }
        });
    }

    handleEndCollision(event) {
        event.pairs.forEach((pair) => {
            if (
                (pair.bodyA === this.body || pair.bodyB === this.body) &&
                (pair.bodyA.collisionFilter.category ===
                    this.scene.CATEGORY_PLATFORM ||
                    pair.bodyB.collisionFilter.category ===
                        this.scene.CATEGORY_PLATFORM)
            ) {
                this.isGrounded = false;
            }
        });
    }

    updateSupremeJuiceFromJuggling() {
        let totalBounceGain = 0;
        this.scene.juggledObjects.forEach((obj) => {
            if (obj.bounceCount !== undefined) {
                totalBounceGain += Math.pow(1.02, obj.bounceCount);
            } else {
                totalBounceGain += 1;
            }
        });
        const gain =
            this.SupremeJuice +
            this.scene.juggledObjects.length +
            totalBounceGain;
        this.SupremeJuice = Math.min(100, gain);
    }

    upgradeBasicAttack() {
        this.basicAttack.attackSpeed *= 1.05; // Increase by 5%
        this.basicAttack.attackPushback *= 1.05; // Increase by 5%
        this.basicAttack.cooldown = Math.max(
            50,
            this.basicAttack.cooldown * 0.95
        ); // Decrease by 5%, capped at 50
    }

    upgradeBombAttack() {
        this.bombAttack.cooldown = Math.max(
            500,
            this.bombAttack.cooldown * 0.95
        );
        this.bombAttack.explosionRadius *= 1.05;
    }

    upgradeBlackholeAttack() {
        this.blackholeAttack.cooldown = Math.max(
            1000,
            this.blackholeAttack.cooldown * 0.95
        );
        this.blackholeAttack.blackholeRadius *= 1.05;
        this.blackholeAttack.maxCapacity *= 1.05;
        this.blackholeAttack.count = Math.min(
            6,
            Math.floor(this.blackholeAttack.count * 1.1)
        );
    }

    // Method to add an attack to the inventory (push onto the stack)
    addAttack(attack) {
        this.inventory.push(attack);
        console.log('Attack added to inventory:', attack.name);
    }

    // refactor: treat this.inventory as a fifo queue, protecting index 0
    removeAttack() {
        if (this.inventory.length > 0) {
            // Use shift() to remove from the beginning (FIFO)
            const removedAttack = this.inventory.shift();
            console.log('Attack removed from inventory:', removedAttack.name);
            return removedAttack;
        }
    }

    // Method to use each attack in the inventory
    useAttack() {
        // Always use the basic attack first
        this.basicAttack.use(this);

        // Then iterate through the rest of the inventory
        for (let i = 0; i < this.inventory.length; i++) {
            const attack = this.inventory[i];
            if (attack) {
                // Check if the attack has a cooldown and if it's ready
                if (attack.lastUsedTime === undefined) {
                    attack.lastUsedTime = 0; // Initialize if not present
                }

                if (
                    this.scene.time.now - attack.lastUsedTime >=
                    attack.cooldown
                ) {
                    attack.use(this); // Pass the player instance to the attack's use method
                    attack.lastUsedTime = this.scene.time.now; // Update last used time
                } else {
                    // console.log(attack.name, 'is on cooldown.'); // Optional: log cooldown
                }
            }
        }
    }

    triggerSupremeAttack() {
        const head = this.scene.head;
        head.tween.pause();

        // make the head float up to the center of the screen, keep track of the original position
        this.originalHeadPosition.x = head.x;
        this.originalHeadPosition.y = head.y;

        this.scene.matter.world.engine.timing.timeScale = 0.1;

        // I want to this to snap up really fast
        this.scene.tweens.add({
            targets: head,
            x: this.scene.scale.width / 2,
            y: this.scene.scale.height / 2,
            duration: 200, // Reduced duration for a faster snap
            ease: 'back.easeout', // Use sine.out for a quick snap
            onComplete: () => {
                // After the attack, tween the head back to its original position
                this.scene.time.delayedCall(
                    1000, // Wait for the blackhole duration
                    () => {
                        this.scene.matter.world.engine.timing.timeScale = 1;
                        this.scene.tweens.add({
                            targets: head,
                            x: this.originalHeadPosition.x,
                            y: this.originalHeadPosition.y,
                            duration: 1000, // Duration of the float back down
                            ease: 'sine.inout',
                            onComplete: () => {
                                head.tween.resume(); // Resume the wobbly tween
                            },
                        });
                    }
                );
            },
        });
    }

    update(cursors) {
        // Player movement
        if (cursors.left.isDown) {
            this.applyForce({ x: -this.acceleration, y: 0 });
            this.playerDirection = -1;
            this.anims.play('walk', true);
            this.flipX = true; // Flip the sprite for left movement
        } else if (cursors.right.isDown) {
            this.applyForce({ x: this.acceleration, y: 0 });
            this.playerDirection = 1;
            this.anims.play('walk', true);
            this.flipX = false; // Do not flip the sprite for right movement
        } else {
            this.anims.play('stand');
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
            // Calculate health to restore (2:1 ratio)
            const healthToRestore = this.SupremeJuice / 2;
            this.hp = Math.min(100, this.hp + healthToRestore);

            if (this.SupremeJuice >= 0) {
                this.triggerSupremeAttack();
            } else if (this.SupremeJuice >= 75) {
                this.addAttack(this.blackholeAttack);
                this.scene.time.delayedCall(
                    this.blackholeAttackDuration,
                    this.removeAttack,
                    [],
                    this
                );
                this.upgradeBlackholeAttack();
            } else if (this.SupremeJuice >= 50) {
                this.addAttack(this.bombAttack);
                this.scene.time.delayedCall(
                    this.bombAttackDuration,
                    this.removeAttack,
                    [],
                    this
                );
                this.upgradeBombAttack();
            } else if (this.SupremeJuice >= 25) {
                this.upgradeBasicAttack();
            }

            // Consume all Supreme Juice when spacebar is pressed
            this.SupremeJuice = 0;
        }

        // Cap the velocity
        const velocityX = Phaser.Math.Clamp(
            this.body.velocity.x,
            -this.maxSpeed,
            this.maxSpeed
        );
        this.setVelocityX(velocityX);

        // Rotate the player to be perpendicular to the platform
        this.rotation = this.scene.platform.rotation;
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            // Handle player death here (e.g., game over)
            console.log('Player Died!');
            // You might want to trigger a game over scene or restart the level
            //this.scene.scene.start('GameOverScene'); // Assuming you have a GameOverScene
        }
    }
}
