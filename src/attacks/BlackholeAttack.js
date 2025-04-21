import Phaser from 'phaser';
import { Blackhole } from '../Blackhole';

export class BlackholeAttack {
    constructor(scene, count = 3) {
        this.scene = scene;
        this.name = 'BlackholeAttack';
        this.cooldown = 5000; // Cooldown in milliseconds (e.g., 5 seconds)
        this.lastUsedTime = 0; // Timestamp of the last time the attack was used
        this.count = count ?? 2;
        this.blackholeRadius = 50; // Default radius
        this.maxCapacity = 3;
    }

    use(player) {
        // Check if the attack is on cooldown
        if (this.scene.time.now - this.lastUsedTime < this.cooldown) {
            return;
        }

        this.lastUsedTime = this.scene.time.now;

        const num = Math.min(4, Math.floor(this.count));

        // create a blackhole for each this.count
        for (let i = 0; i < num; i++) {
            const margin = 100; // Margin from the screen edges
            const spawnAreaWidth = this.scene.scale.width - 2 * margin;
            const randomOffsetX = Phaser.Math.FloatBetween(
                -spawnAreaWidth / 2,
                spawnAreaWidth / 2
            );
            const randomOffsetY = Phaser.Math.FloatBetween(-100, 0); // Adjust range as needed (above the player)
            const blackholeX = this.scene.scale.width / 2 + randomOffsetX;
            const blackholeY = player.y + randomOffsetY;

            const blackhole = new Blackhole(
                this.scene,
                blackholeX,
                blackholeY,
                this.blackholeRadius,
                this.maxCapacity
            );
            this.scene.blackholes.push(blackhole); // Add the blackhole to the scene's list
        }
    }
}
