import Phaser from "phaser";

export class Player extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'player', 0, {
            label: 'player',
        });
        scene.add.existing(this);

        this.scene = scene;
        this.playerMass = 0.5;
        this.acceleration = 0.001;
        this.maxSpeed = 3;
        this.minSlideSpeed = 1;
        //this.airFriction = 0.0001;
        this.playerDirection = 1;
        this.attackSpeed = 15;
        this.attackRadius = 15;
        this.attackPushback = 25; // Increased attack pushback
        this.attackCooldown = 500;
        this.isAttacking = false;
        this.lastAttackTime = 0;

        this.setRectangle(16, 32);
        this.setMass(this.playerMass);
        this.setFriction(1);
        this.setFrictionStatic(0.1);
        this.setBounce(0.5);
        this.setFixedRotation();
        this.setCollisionCategory(this.scene.CATEGORY_PLAYER);
        this.setScale(2); // Double the scale of the player sprite

        this.attackArea = null;

        // Create animations
        this.scene.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNumbers('player', {
                start: 0,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'stand',
            frames: [{ key: 'player', frame: 8 }],
            frameRate: 20,
        });

        this.anims.play('stand');
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
            // Decelerate when no key is pressed
            if (Math.abs(this.body.velocity.x) > this.minSlideSpeed) {
                if (this.body.velocity.x > 0) {
                    this.applyForce({ x: -this.acceleration, y: 0 });
                } else if (this.body.velocity.x < 0) {
                    this.applyForce({ x: this.acceleration, y: 0 });
                }
            } else {
                this.setVelocityX(0);
            }
            this.anims.play('stand');
        }

        // Cap the velocity
        const velocityX = Phaser.Math.Clamp(this.body.velocity.x, -this.maxSpeed, this.maxSpeed);
        this.setVelocityX(velocityX);

        // Rotate the player to be perpendicular to the platform
        this.rotation = this.scene.platform.rotation;
    }
}
