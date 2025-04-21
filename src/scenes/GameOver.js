import { Scene } from 'phaser';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    init() {
        this.cameras.main.fadeIn(100);
        const fxCamera = this.cameras.main.postFX.addPixelate(40);
        this.add.tween({
            targets: fxCamera,
            duration: 700,
            amount: -1,
        });
    }

    create() {
        this.cameras.main.setBackgroundColor(0xff0000);

        const width = this.scale.width;
        const height = this.scale.height;

        this.add
            .text(width / 2, height / 2, 'Game Over', {
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
