import Phaser from 'phaser';

// I want this class a compsitite of several sprite/images. extend the container class instead
export class Head extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;

        scene.add.existing(this);

        // Add the 'bald' image as a child of the container
        this.baldImage = scene.add.image(0, 0, 'head', 3);
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

        this.leftIris = scene.add.image(0, 0, 'leftiris', 0); // Adjust position as needed
        this.rightIris = scene.add.image(0, 0, 'rightiris', 0); // Adjust position as needed
        this.add(this.leftIris);
        this.add(this.rightIris);
        this.leftIris.setScale(0.5);
        this.rightIris.setScale(0.5);

        // Define the boundary for iris movement relative to the head container's center
        this.irisBoundary = new Phaser.Geom.Circle(0, 0, 6); // Adjust the radius as needed

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
        // Get the player position relative to the head container
        const playerX = this.scene.player.x - this.x;
        const playerY = this.scene.player.y - this.y;

        // Calculate the angle from the head's center to the player
        const angle = Phaser.Math.Angle.Between(0, 0, playerX, playerY);

        // Calculate the distance from the head's center to the player
        const distance = Phaser.Math.Distance.Between(0, 0, playerX, playerY);

        // Clamp the distance to the iris boundary radius
        const clampedDistance = Math.min(distance, this.irisBoundary.radius);

        // Calculate the new position for the irises based on the clamped distance and angle
        const irisOffsetX = Math.cos(angle) * clampedDistance;
        const irisOffsetY = Math.sin(angle) * clampedDistance;

        // Update the iris positions
        this.leftIris.x = irisOffsetX;
        this.leftIris.y = 2 + irisOffsetY;

        this.rightIris.x = irisOffsetX;
        this.rightIris.y = 2 + irisOffsetY;
    }
}
