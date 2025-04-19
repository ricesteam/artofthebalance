import Phaser from 'phaser';

export class BasicAttack {
    constructor(scene) {
        this.scene = scene;
        this.name = 'BasicAttack';
        this.attackSpeed = 15;
        this.attackRadius = 15;
        this.attackPushback = 5;
        this.maxCapacity = 3;
        this.cooldown = 300; // Cooldown in milliseconds
        this.lastUsedTime = 0; // Timestamp of the last time the attack was used
    }

    use(player) {
        // Check if the attack is on cooldown
        if (this.scene.time.now - this.lastUsedTime < this.cooldown) {
            return;
        }

        this.lastUsedTime = this.scene.time.now;

        // Get the platform's angle in radians
        const platformAngle = this.scene.platform.rotation;

        // Initial position: player's center
        const attackX = player.body.position.x;
        const attackY = player.body.position.y;

        // Create the attack area as a circle
        const attackArea = this.scene.matter.add.circle(
            attackX,
            attackY,
            this.attackRadius,
            {
                label: 'attack1',
                collisionFilter: {
                    category: this.scene.CATEGORY_ATTACK,
                    mask: this.scene.CATEGORY_BLOCK | this.scene.CATEGORY_ENEMY,
                },
                isSensor: true,
            }
        );

        // can I attach an array victims to the attackArea? will it free up memory once attackArea is removed from the matter.world ai?
        // Add collision handling specifically for this attack area
        attackArea.onCollideCallback = (pair) => {
            const { bodyA, bodyB } = pair;

            // Determine which body is the other object
            let otherBody = bodyA === attackArea ? bodyB : bodyA;
            let otherGameObject = otherBody.gameObject;

            // Check if the other object is already a victim or if we've reached max capacity
            if (otherGameObject) {
                const direction = this.scene.player.playerDirection;
                const pushbackDirection = new Phaser.Math.Vector2(direction, 0);
                pushbackDirection.rotate(this.scene.platform.rotation);
                pushbackDirection.scale(this.attackPushback);

                // use setVelocity as you previously mentioned
                otherGameObject.setVelocity(
                    pushbackDirection.x,
                    pushbackDirection.y
                );

                // Check if the other object is an enemy
                if (otherGameObject.name === 'maga') {
                    otherGameObject.takeDamage(1);
                }
            }
        };

        // Calculate velocity based on player direction and attack speed
        let velocityX = this.attackSpeed * player.playerDirection;
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
        this.scene.matter.setVelocity(attackArea, velocityX, velocityY);

        // Destroy the attack area after a short delay
        this.scene.time.delayedCall(50, () => {
            this.scene.matter.world.remove(attackArea);
        });
    }
}
