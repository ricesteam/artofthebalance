import Phaser from 'phaser';

export class Player extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'player', 0, {
            label: 'player',
        });
        scene.add.existing(this);

        this.scene = scene;
        this.world = scene.matter.world;
        this.playerMass = 0.5;
        this.acceleration = 0.001;
        this.maxSpeed = 3;
        this.minSlideSpeed = 1;
        //this.airFriction = 0.0001;
        this.playerDirection = 1;
        this.attackSpeed = 15;
        this.attackRadius = 15;
        this.attackCooldown = 300;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        this.isGrounded = false; // Track if the player is on the ground
        this.jumpForce = -0.012; // Upward jump force
        this.hp = 100;

        this.setRectangle(16, 32);
        this.setMass(this.playerMass);
        this.setFriction(0.1);
        this.setFrictionStatic(0.1);
        this.setFrictionAir(0);
        this.setBounce(0.5);
        this.setFixedRotation();
        this.setCollisionCategory(this.scene.CATEGORY_PLAYER);
        this.setScale(2); // Double the scale of the player sprite

        this.attackArea = null;

        this.anims.play('stand');

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

        // Simple inventory for slottable attacks
        this.inventory = [null, null]; // Array to hold up to 2 attack objects

        // Timer for auto-attacking with the first equipped attack
        this.autoAttackTimer = this.scene.time.addEvent({
            delay: 500, // Adjust the delay as needed (e.g., 500ms for 2 attacks per second)
            callback: () => {
                this.useAttack(0); // Use the attack in the first inventory slot
            },
            callbackScope: this,
            loop: true,
        });
    }

    handleCollision(event) {
        event.pairs.forEach((pair) => {
            if (
                (pair.bodyA === this.body || pair.bodyB === this.body) &&
                (pair.bodyA.collisionFilter.category ===
                    this.scene.CATEGORY_PLATFORM ||
                    pair.bodyB.collisionFilter.category ===
                        this.scene.CATEGORY_PLATFORM)
            ) {
                this.isGrounded = true;
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

    // Method to add an attack to the inventory
    addAttack(attack) {
        if (this.inventory[0] === null) {
            this.inventory[0] = attack;
            console.log('Attack added to slot 1:', attack.name);
        } else if (this.inventory[1] === null) {
            this.inventory[1] = attack;
            console.log('Attack added to slot 2:', attack.name);
        } else {
            console.log('Inventory is full. Cannot add', attack.name);
        }
    }

    // Method to remove an attack from the inventory by index (0 or 1)
    removeAttack(index) {
        if (index >= 0 && index < this.inventory.length) {
            const removedAttack = this.inventory[index];
            if (removedAttack) {
                this.inventory[index] = null;
                console.log(
                    'Attack removed from slot',
                    index + 1 + ':',
                    removedAttack.name
                );
            } else {
                console.log('Slot', index + 1, 'is already empty.');
            }
        } else {
            console.log('Invalid inventory slot index:', index);
        }
    }

    // Method to use an attack from the inventory by index (0 or 1)
    useAttack(index) {
        if (index >= 0 && index < this.inventory.length) {
            const attack = this.inventory[index];
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
            } else {
                // console.log('No attack in slot', index + 1); // Optional: log empty slot
            }
        } else {
            console.log('Invalid inventory slot index:', index);
        }
    }

    attack() {
        if (
            this.isAttacking ||
            this.scene.time.now - this.lastAttackTime < this.attackCooldown
        ) {
            return;
        }

        this.isAttacking = true;
        this.lastAttackTime = this.scene.time.now;

        // Get the platform's angle in radians
        const platformAngle = this.scene.platform.rotation;

        // Initial position: player's center
        const attackX = this.body.position.x;
        const attackY = this.body.position.y;

        // Create the attack area as a circle
        this.attackArea = this.scene.matter.add.circle(
            attackX,
            attackY,
            this.attackRadius,
            {
                label: 'attack1',
                collisionFilter: {
                    category: this.scene.CATEGORY_ATTACK,
                    mask: this.scene.CATEGORY_BLOCK | this.scene.CATEGORY_ENEMY,
                },
            }
        );

        // Calculate velocity based on player direction and attack speed
        let velocityX = this.attackSpeed * this.playerDirection;
        let velocityY = 0;

        // Rotate the velocity vector by the platform angle
        const rotatedVelocity = Phaser.Math.RotateAround(
            { x: velocityX, y: velocityY },
            0,
            0,
            platformAngle
        );

        velocityX = rotatedVelocity.x;
        velocityY = rotatedVelocity.y;

        // Apply the velocity to the attack area
        this.scene.matter.setVelocity(this.attackArea, velocityX, velocityY);

        // Destroy the attack area after a short delay
        this.scene.time.delayedCall(50, () => {
            this.scene.matter.world.remove(this.attackArea);
            this.attackArea = null;
            this.isAttacking = false;
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

        // Jumping
        if (cursors.space.isDown && this.isGrounded) {
            this.applyForce({ x: 0, y: this.jumpForce }); // Apply upward force for the jump
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

    // add a takeDamage method that other enemies call when they attack the player ai!
}
