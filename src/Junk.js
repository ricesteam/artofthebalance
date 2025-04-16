export default class Junk extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'block');
        scene.add.existing(this);

        this.setBounce(0.5);
        this.setFriction(0.01);
        this.setMass(2);
        this.setCollisionCategory(scene.CATEGORY_BLOCK);
        scene.blocks.push(this); // Add the block to the array
    }
}
