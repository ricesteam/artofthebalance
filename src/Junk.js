export default class Junk extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'block');
        scene.add.existing(this);

        this.setBounce(0.5);
        this.setFriction(0.01);
        this.initialMass = 2;
        this.setMass(this.initialMass);
        this.setCollisionCategory(scene.CATEGORY_BLOCK);
        // scene.blocks.push(this); // Add the block to the array - REMOVED
    }

    takeDamage(damage) {
        const newMass = Math.max(0.1, this.body.mass - damage); // Ensure mass doesn't go below 0.1
        this.setMass(newMass);
    }
}
