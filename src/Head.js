import Phaser from 'phaser';

export class Head extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'head', 0, {
            label: 'head',
            shape: {
                type: 'circle',
                radius: 8,
            },
        });
        this.scene = scene;
        this.world = scene.matter.world;
        this.matter = scene.matter;

        scene.add.existing(this);

        this.setMass(0.5);
        this.setFriction(0.1);
        this.setFrictionStatic(0.1);
        this.setBounce(0.8);
        this.setCollisionCategory(this.scene.CATEGORY_BLOCK); // Example category
        this.setCollidesWith([
            this.scene.CATEGORY_BLOCK,
            this.scene.CATEGORY_PLAYER,
            this.scene.CATEGORY_ATTACK,
            this.scene.CATEGORY_PLATFORM,
            this.scene.CATEGORY_ENEMY,
        ]);
        this.setScale(2);
        this.name = 'head';
    }

    update() {
        // Head specific update logic goes here
    }
}
