import Phaser from 'phaser';
import { Blackhole } from '../Blackhole';

export class BlackholeAttack {
    constructor(scene, count = 2) {
        this.scene = scene;
        this.name = 'BlackholeAttack';
        this.cooldown = 5000; // Cooldown in milliseconds (e.g., 5 seconds)
        this.lastUsedTime = 0; // Timestamp of the last time the attack was used
        this.count = count ?? 2;
        this.blackholeRadius = 50; // Default radius
    }

    use(player) {
        // Check if the attack is on cooldown
        if (this.scene.time.now - this.lastUsedTime < this.cooldown) {
            return;
        }

        this.lastUsedTime = this.scene.time.now;

        // create a blackhole for each this.count
        for (let i = 0; i < this.count; i++) {
            const randomOffsetX = Phaser.Math.FloatBetween(-50, 50); // the range can be the width of the screen - some margin ai!
            const randomOffsetY = Phaser.Math.FloatBetween(-100, -50); // Adjust range as needed (above the player)
            const blackholeX = player.x + randomOffsetX;
            const blackholeY = player.y + randomOffsetY;

            const blackhole = new Blackhole(
                this.scene,
                blackholeX,
                blackholeY,
                this.blackholeRadius
            );
            this.scene.blackholes.push(blackhole); // Add the blackhole to the scene's list
        }
    }
}
