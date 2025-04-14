export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.playerMass = 0.4;
        this.acceleration = 0.1;
        this.maxSpeed = 3;
        this.minSlideSpeed = 1;
        this.airFriction = 0.0001;
        this.playerDirection = 1;
        this.attackSpeed = 10;
        this.attackRadius = 15;
        this.attackPushback = 5;
        this.attackCooldown = 500;
        this.isAttacking = false;
        this.lastAttackTime = 0;

        this.player = this.scene.matter.add.image(x, y, 'player');
        this.player.setCircle(16);
        this.player.setMass(this.playerMass);
        this.player.setFriction(0);
        this.player.setFrictionStatic(0);
        this.player.setBounce(0.5);
        this.player.setFixedRotation();
        this.player.setCollisionCategory(this.scene.CATEGORY_PLAYER);

        this.attackArea = null;
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
        const attackX = this.player.x;
        const attackY = this.player.y;

        // Create the attack area as a circle
        this.attackArea = this.scene.matter.add.circle(
            attackX,
            attackY,
            this.attackRadius,
            {
                collisionFilter: {
                    category: this.scene.CATEGORY_ATTACK,
                    mask: this.scene.CATEGORY_BLOCK, // Only collide with blocks
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
            this.player.setVelocityX(
                Math.max(
                    this.player.body.velocity.x - this.acceleration,
                    -this.maxSpeed
                )
            );
            this.playerDirection = -1;
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(
                Math.min(
                    this.player.body.velocity.x + this.acceleration,
                    this.maxSpeed
                )
            );
            this.playerDirection = 1;
        } else {
            // Decelerate when no key is pressed
            if (Math.abs(this.player.body.velocity.x) > this.minSlideSpeed) {
                if (this.player.body.velocity.x > 0) {
                    this.player.setVelocityX(
                        Math.max(
                            this.player.body.velocity.x - this.acceleration,
                            0
                        )
                    );
                } else if (this.player.body.velocity.x < 0) {
                    this.player.setVelocityX(
                        Math.min(
                            this.player.body.velocity.x + this.acceleration,
                            0
                        )
                    );
                }
            }
        }
    }
}
