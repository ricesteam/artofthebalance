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
    }

    addBlock() {
        let x = this.spawnArea.x + Math.random() * this.spawnArea.width; // Random X position within spawn area
        let y = this.spawnArea.y;
        let block = this.scene.matter.add.image(x, y, 'block');
        block.setBounce(0.5);
        block.setFriction(0.01);
        block.setMass(1);
        block.setCollisionCategory(this.scene.CATEGORY_BLOCK);
        this.scene.blocks.push(block); // Add the block to the array
    }
}
