import { Bomb } from '../Bomb';

export class BombAttack {
    constructor(scene) {
        this.scene = scene;
        this.name = 'BombAttack';
        this.cooldown = 2000; // Cooldown in milliseconds (e.g., 2 seconds)
        this.lastUsedTime = 0; // Timestamp of the last time the attack was used
    }

    use(player) {
        // Check if the attack is on cooldown
        if (this.scene.time.now - this.lastUsedTime < this.cooldown) {
            return;
        }

        this.lastUsedTime = this.scene.time.now;

        // Create a new Bomb instance at the player's position
        const bomb = new Bomb(this.scene, player.x, player.y);
    }
}
