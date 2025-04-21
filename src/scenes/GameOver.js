import { Scene } from 'phaser';
import { Head } from '../Head';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
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
        const width = this.scale.width;
        const height = this.scale.height;

        // Create the Head instance
        this.head = new Head(this, width / 2, height / 2);
        this.head.setDepth(0);
        this.head.tween.stop();
        this.head.eyesGoRound();

        // Manually switch frames for the baldImage to loop frames 4-6
        let currentFrame = 4;
        this.time.addEvent({
            delay: 200, // Adjust delay between frames as needed
            callback: () => {
                currentFrame++;
                if (currentFrame > 6) {
                    currentFrame = 4;
                }
                this.head.baldImage.setFrame(currentFrame);
            },
            loop: true,
        });

        this.add
            .text(width / 2, height / 2, this.mainText, {
                fontFamily: 'Arial Black',
                fontSize: 64,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center',
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
