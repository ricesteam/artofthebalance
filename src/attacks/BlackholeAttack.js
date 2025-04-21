import Phaser from 'phaser';
import { Blackhole } from '../Blackhole';

export class BlackholeAttack {
    constructor(scene, count = 2) {
        this.scene = scene;
        this.name = 'BlackholeAttack';
        this.cooldown = 5000; // Cooldown in milliseconds (e.g., 5 seconds)
        this.lastUsedTime = 0; // Timestamp of the last time the attack was used
        this.count = count ?? 2;
    }

    use(player) {
        // Check if the attack is on cooldown
        if (this.scene.time.now - this.lastUsedTime < this.cooldown) {
            return;
        }

        this.lastUsedTime = this.scene.time.now;

        // create a blackhole for each this.count ai!
        const blackhole = new Blackhole(this.scene, player.x, player.y);
        this.scene.blackholes.push(blackhole); // Add the blackhole to the scene's list
    }
}
