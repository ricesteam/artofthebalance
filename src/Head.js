import Phaser from 'phaser';

export class Head extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'head', 0);
        this.scene = scene;

        scene.add.existing(this);

        this.setScale(2);
        this.name = 'head';
    }

    update() {
        // Head specific update logic goes here
    }
}
