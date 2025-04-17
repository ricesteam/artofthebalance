import Phaser from 'phaser';

export class Junk extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'block', 0, {
            label: 'junk',
            shape: {
                type: 'rectangle',
                width: 32,
                height: 32,
            },
        });
        scene.add.existing(this);

        this.setBounce(0.5);
        this.setFriction(0.01);
        this.initialMass = 2;
        this.setMass(this.initialMass);
        this.setCollisionGroup(-1);
        this.setCollidesWith([
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
        ]);
        this.setCollisionCategory(scene.CATEGORY_BLOCK);
        // scene.blocks.push(this); // Add the block to the array - REMOVED
    }

    takeDamage(damage) {
        //const newMass = Math.max(0.1, this.body.mass - damage);
        //this.setMass(newMass);
    }
}
