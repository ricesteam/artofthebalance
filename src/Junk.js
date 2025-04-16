export default class Junk {
    constructor(scene) {
        this.scene = scene;
    }

    addBlock(x, y) {
        let block = this.scene.matter.add.image(x, y, 'block');
        block.setBounce(0.5);
        block.setFriction(0.01);
        block.setMass(2);
        block.setCollisionCategory(this.scene.CATEGORY_BLOCK);
        this.scene.blocks.push(block); // Add the block to the array
    }
}
