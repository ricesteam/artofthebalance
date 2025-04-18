import Phaser from 'phaser';

export class BasicAttack {
    constructor(scene) {
        this.scene = scene;
        this.name = 'BasicAttack';
        this.attackSpeed = 15;
        this.attackRadius = 15;
        this.attackPushback = 5;
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
            }
        );

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
