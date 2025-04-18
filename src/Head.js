import Phaser from 'phaser';

// I want this class a compsitite of several sprite/images. extend the container class instead
export class Head extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;

        scene.add.existing(this);

        // Add the 'bald' image as a child of the container
        this.baldImage = scene.add.image(0, 0, 'bald', 0);
        this.add(this.baldImage);

        this.baldImage.setScale(0.5).setOrigin(0.5, 1);
        this.name = 'head';

        // Add a wobbly tween effect to the bald image (targeting the container)
        this.scene.tweens.add({
            targets: this,
            y: () =>
                Phaser.Math.FloatBetween(
                    this.scene.scale.height + 80,
                    this.scene.scale.height + 30
                ), // Move slightly up and down
            rotation: () => Phaser.Math.FloatBetween(-0.06, 0.06), // Rotate slightly
            duration: 1500, // Duration of the tween
            yoyo: true, // Make it go back and forth
            repeat: -1, // Repeat infinitely
            ease: 'quart.inout',
        });

        // add both left and right eye lid images here ai!
    }

    update() {
        // Head specific update logic goes here
    }
}
