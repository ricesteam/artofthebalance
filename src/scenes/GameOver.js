import { Scene } from 'phaser';
import { Head } from '../Head';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');

        this.endings = [
            {
                text:
                    'In the final seconds, as noodles surged across the borders like a starchy tidal wave, the Supreme Leader paused…\n\n' +
                    'Was 34% too much? Would 12% seem weak?\n\n' +
                    'Paralyzed by indecision, he stared into the abyss of fiscal spreadsheets—mouth agape, finger trembling above the Tariff Slider™.\n\n' +
                    'But time waits for no man.\n' +
                    'Especially not one drowning in imported ramen.\n\n' +
                    'The deficit ballooned. The economy collapsed under the sheer weight of saucy noodles.\n' +
                    'The Hegemony crumbled, slurped into history by its own appetite.\n\n' +
                    'And as silence fell over the land, the people slowly realized…\n\n' +
                    "Maybe… just maybe… trade isn't a zero-sum game.\n\n" +
                    'World peace emerged, cautiously and gluten-free.',
            },
        ];
    }

    init(data) {
        this.cameras.main.fadeIn(100);
        const fxCamera = this.cameras.main.postFX.addPixelate(40);
        this.add.tween({
            targets: fxCamera,
            duration: 700,
            amount: -1,
        });

        // Access the data passed from the previous scene
        this.balanceMeter = data.balanceMeter;
        this.mainText = data.mainText ?? 'Game Over';
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        const width = this.scale.width;
        const height = this.scale.height;

        // Create the Head instance
        this.head = new Head(this, width / 2, height / 2);
        this.head.setDepth(0);
        this.head.tween.stop(); // Stop the wobbly tween from GameScene
        this.head.eyesGoRound();

        this.head.baldImage.setFrame(5);

        // Add a tween to make the head float and tilt
        this.tweens.add({
            targets: this.head,
            y: this.head.y - 20, // Float up by 20 pixels
            rotation: {
                value: () => Phaser.Math.FloatBetween(-0.1, 0.1), // Tilt slightly
                duration: 1500, // Duration of the tilt
                yoyo: true, // Go back and forth
                repeat: -1, // Repeat indefinitely
                ease: 'bounce.easeInOut', // Smooth easing
            },
            duration: 2000, // Duration of the float
            yoyo: true, // Go back down
            repeat: -1, // Repeat indefinitely
            ease: 'Sine.easeInOut', // Smooth easing
        });

        const gameOver = this.add
            .text(width / 2, height / 2, this.mainText, {
                fontFamily: 'retro',
                fontSize: 64,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center',
            })
            .setOrigin(0.5);

        // Add a delayed call to start scrolling the text
        this.time.delayedCall(2000, () => {
            const endingText = this.add
                .text(width / 2, height + 50, this.endings[0].text, {
                    fontFamily: 'retro',
                    fontSize: '24px',
                    fill: '#ffffff',
                    align: 'center',
                    wordWrap: { width: width - 100 }, // Wrap text within the screen width
                })
                .setOrigin(0.5, 0); // Align to the top-center

            // Tween to scroll the text upwards
            this.tweens.add({
                targets: endingText,
                y: -endingText.height - 50, // Scroll up until it's off-screen
                duration: 30000, // Adjust duration for scrolling speed
                ease: 'Linear',
                onComplete: () => {
                    endingText.destroy();
                },
            });
        });

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
