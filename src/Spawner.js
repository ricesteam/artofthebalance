import Junk from './Junk.js';
import Enemy from './Enemy.js';

export default class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.spawnArea = {
            x: scene.scale.width * 0.2,
            y: 50,
            width: scene.scale.width * 0.6,
        };

        // Add a timer to spawn blocks periodically
        this.scene.time.addEvent({
            delay: 2000, // Spawn a block every 2 seconds
            callback: this.addBlock,
            callbackScope: this,
            loop: true,
        });

        // Add a timer to spawn enemies periodically
        this.scene.time.addEvent({
            delay: 5000, // Spawn an enemy every 5 seconds
            callback: this.addEnemy,
            callbackScope: this,
            loop: true,
        });
    }

    addBlock() {
        let x = this.spawnArea.x + Math.random() * this.spawnArea.width; // Random X position within spawn area
        let y = this.spawnArea.y;
        const block = new Junk(this.scene, x, y);
        this.scene.blocks.push(block);
    }

    addEnemy() {
        let x = this.spawnArea.x + Math.random() * this.spawnArea.width; // Random X position within spawn area
        let y = this.spawnArea.y;
        const enemy = new Enemy(this.scene, x, y);
        this.scene.enemies.push(enemy);
    }
}
