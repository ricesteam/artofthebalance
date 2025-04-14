export default class Spawner {
    constructor(scene) {
        this.scene = scene;
    }

    addBlock(x, y, side) {
        let block = this.scene.matter.add.image(x, y, 'block');
        block.setBounce(0.5);
        block.setFriction(0);
        block.setMass(1);
        block.setCollisionCategory(this.scene.CATEGORY_BLOCK);
        this.scene.blocks.push(block); // Add the block to the array
    }
}
