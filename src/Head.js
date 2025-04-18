import Phaser from 'phaser';

export class Head extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'head', 0);
        this.scene = scene;

        scene.add.existing(this);

        this.setScale(2);
        this.name = 'head';

        // Add a wobbly tween effect to the bald image
        this.scene.tweens.add({
            targets: this,
            y: () => Phaser.Math.FloatBetween(this.scene.scale.height + 80, this.scene.scale.height + 30), // Move slightly up and down
            rotation: () => Phaser.Math.FloatBetween(-0.06, 0.06), // Rotate slightly
            duration: 1500, // Duration of the tween
            yoyo: true, // Make it go back and forth
            repeat: -1, // Repeat infinitely
            ease: 'quart.inout',
        });
    }

    update() {
        // Head specific update logic goes here
    }
}
