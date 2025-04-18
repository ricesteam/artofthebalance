import Phaser from 'phaser';

// I want this class a compsitite of several sprite/images. extend the container class instead
export class Head extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;

        scene.add.existing(this);

        // I changed the bald image to head.png which is a spritesheet, load it and set it on frame 3 ai!
        // Add the 'bald' image as a child of the container
        this.baldImage = scene.add.image(0, 0, 'bald', 0);
        this.add(this.baldImage);

        this.baldImage.setScale(0.5); //.setOrigin(0.5, 1);
        this.name = 'head';

        // Add a wobbly tween effect to the bald image (targeting the container)
        this.scene.tweens.add({
            targets: this,
            y: () =>
                Phaser.Math.FloatBetween(
                    this.scene.scale.height + 30,
                    this.scene.scale.height + 20
                ), // Move slightly up and down
            rotation: () => Phaser.Math.FloatBetween(-0.06, 0.06), // Rotate slightly
            duration: 1500, // Duration of the tween
            yoyo: true, // Make it go back and forth
            repeat: -1, // Repeat infinitely
            ease: 'quart.inout',
        });

        // I want the eyelids visibility to be on/off so it appears as he's blinking
        this.leftEyeLid = scene.add.image(0, 0, 'lefteyelid', 0); // Adjust position as needed
        this.rightEyeLid = scene.add.image(0, 0, 'righteyelid', 0); // Adjust position as needed
        this.leftEyeLid.setVisible(false);
        this.rightEyeLid.setVisible(false);
        this.add(this.leftEyeLid);
        this.add(this.rightEyeLid);

        this.leftEyeLid.setScale(0.5);
        this.rightEyeLid.setScale(0.5);

        // Start blinking timer
        this.startBlinking();
    }

    startBlinking() {
        // Set a timer for random blinking
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 5000), // Blink every 2-5 seconds
            callback: this.blink,
            callbackScope: this,
            loop: true,
        });
    }

    blink() {
        // Make eyelids visible for a short duration
        this.leftEyeLid.setVisible(true);
        this.rightEyeLid.setVisible(true);

        this.scene.time.addEvent({
            delay: 100, // Eyelids visible for 100ms
            callback: () => {
                this.leftEyeLid.setVisible(false);
                this.rightEyeLid.setVisible(false);
            },
            callbackScope: this,
            loop: false,
        });
    }

    update() {
        // Head specific update logic goes here
    }
}
