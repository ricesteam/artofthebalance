import { Bomb } from '../Bomb';

export class BombAttack {
    constructor(scene) {
        this.scene = scene;
        this.name = 'BombAttack';
        this.cooldown = 2000; // Cooldown in milliseconds (e.g., 2 seconds)
        this.lastUsedTime = 0; // Timestamp of the last time the attack was used
        this.bombDelay = 1000;
        this.explosionRadius = 60;
    }

    use(player) {
        // Check if the attack is on cooldown
        if (this.scene.time.now - this.lastUsedTime < this.cooldown) {
            return;
        }

        this.lastUsedTime = this.scene.time.now;

        // Create a new Bomb instance at a random position near the player
        const randomOffsetX = Phaser.Math.FloatBetween(-50, 50); // Adjust range as needed
        const randomOffsetY = 0;
        const bombX = player.x + randomOffsetX;
        const bombY = player.y + randomOffsetY;

        const bomb = new Bomb(
            this.scene,
            bombX,
            bombY,
            this.bombDelay,
            this.explosionRadius
        );
    }
}
