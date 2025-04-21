import Phaser from 'phaser';

// I want this class a compsitite of several sprite/images. extend the container class instead
export class Head extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;

        scene.add.existing(this);
        this.setDepth(1);

        // Add the 'bald' image as a child of the container
        this.baldImage = scene.add.image(0, 0, 'head', 4);
        this.add(this.baldImage);

        this.baldImage.setScale(0.5); //.setOrigin(0.5, 1);
        this.name = 'head';

        // Add a wobbly tween effect to the bald image (targeting the container)
        this.tween = this.scene.tweens.add({
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

        this.postFxPlugin = scene.plugins.get('rexGlowFilterPipeline');
        const glowFx = this.postFxPlugin.add(this, {
            inintensity: 0,
        });

        this.glowTween = this.scene.tweens.add({
            targets: glowFx,
            intensity: 0.8,
            duration: 500,
            yoyo: true,
            paused: true,
            loop: -1,
            ease: 'Sine.easeIn',
        });

        this.glowTween.on('loop', (tween) => {
            tween.pause();
            tween.seek(0);
        });
    }

    startBlinking() {
        if (!this.active) return;
        // Set a timer for random blinking
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 5000), // Blink every 2-5 seconds
            callback: this.blink,
            callbackScope: this,
            loop: true,
        });
    }

    closeEyes() {
        if (!this.active) return;
        this.leftEyeLid.setVisible(true);
        this.rightEyeLid.setVisible(true);
    }

    openEyes() {
        if (!this.active) return;
        this.leftEyeLid.setVisible(false);
        this.rightEyeLid.setVisible(false);
    }

    blink() {
        if (!this.active) return;
        this.closeEyes();

        this.scene.time.addEvent({
            delay: 100, // Eyelids visible for 100ms
            callback: () => {
                this.openEyes();
            },
            callbackScope: this,
            loop: false,
        });
    }

    // Helper function to make the eyes go round and round
    eyesGoRound() {
        if (!this.active) return;

        const radius = this.irisBoundary.radius; // Use the defined iris boundary radius
        const duration = 1000; // Duration for one full rotation (adjust as needed)

        this.scene.tweens.add({
            targets: [this.leftIris, this.rightIris],
            x: {
                value: `+=${radius}`, // Move right by the radius
                duration: duration / 4,
                ease: 'Linear',
                yoyo: true,
                repeat: -1,
                onYoyo: function (tween, target) {
                    // Move down after moving right
                    this.scene.tweens.add({
                        targets: target,
                        y: `+=${radius}`,
                        duration: duration / 4,
                        ease: 'Linear',
                    });
                }.bind(this),
                onRepeat: function (tween, target) {
                    // Move up after moving left
                    this.scene.tweens.add({
                        targets: target,
                        y: `-=${radius}`,
                        duration: duration / 4,
                        ease: 'Linear',
                    });
                }.bind(this),
            },
            y: {
                value: `-=${radius}`, // Move up by the radius initially
                duration: duration / 4,
                ease: 'Linear',
                yoyo: true,
                repeat: -1,
                onYoyo: function (tween, target) {
                    // Move left after moving up
                    this.scene.tweens.add({
                        targets: target,
                        x: `-=${radius}`,
                        duration: duration / 4,
                        ease: 'Linear',
                    });
                }.bind(this),
                onRepeat: function (tween, target) {
                    // Move right after moving down
                    this.scene.tweens.add({
                        targets: target,
                        x: `+=${radius}`,
                        duration: duration / 4,
                        ease: 'Linear',
                    });
                }.bind(this),
            },
            duration: duration,
            repeat: -1,
            ease: 'Linear',
        });
    }

    update() {
        if (!this.active) return;

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

    destroy() {
        this.tween.stop();
        this.tween.destroy();
        super.destroy();
    }
}
