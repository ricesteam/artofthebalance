import { Junk } from './Junk';
import { Enemy } from './Enemy';
import { Lawyer } from './Lawyer';
import { Noodles } from './Noodles'; // Import the Noodles class

export class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.spawnArea = {
            x: scene.scale.width * 0.2,
            y: 50,
            width: scene.scale.width * 0.6,
        };

        // Add a timer to spawn blocks periodically
        this.blockSpawnTimer = this.scene.time.addEvent({
            delay: 2000, // Spawn a block every 2 seconds
            callback: this.addBlock,
            callbackScope: this,
            loop: true,
        });

        // Add a timer to spawn enemies periodically
        this.enemySpawnTimer = this.scene.time.addEvent({
            delay: 500, // Spawn an enemy every 5 seconds
            callback: this.addEnemy,
            callbackScope: this,
            loop: true,
        });

        //this.addEnemy();
    }

    addBlock() {
        let x = this.spawnArea.x + Math.random() * this.spawnArea.width; // Random X position within spawn area
        let y = this.spawnArea.y;
        let block;

        block = new Noodles(this.scene, x, y);
        this.scene.blocks.push(block);
    }

    addEnemy() {
        let x = this.spawnArea.x + Math.random() * this.spawnArea.width; // Random X position within spawn area
        let y = this.spawnArea.y;
        const randomNumber = Math.random();
        let enemy;

        //if (randomNumber < 0.5) {
        enemy = new Enemy(this.scene, x, y);
        //} else {
        //    enemy = new Lawyer(this.scene, x, y);
        //}

        this.scene.enemies.push(enemy);
    }
}
