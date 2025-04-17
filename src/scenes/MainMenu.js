import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.image(width / 2, height / 2, 'clouds');
        this.add.image(width / 2, height / 2, 'titlescreen');

        // this.add
        //     .text(width / 2, height / 2 + 100, 'Main Menu', {
        //         fontFamily: 'Arial Black',
        //         fontSize: 38,
        //         color: '#ffffff',
        //         stroke: '#000000',
        //         strokeThickness: 8,
        //         align: 'center',
        //     })
        //     .setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
