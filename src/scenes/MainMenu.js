import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.cloudScrollSpeed = 0.1; // Adjust the scroll speed as needed
        this.cloudTileScaleX = 1;
        this.cloudTileScaleY = 1;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.clouds = this.add.tileSprite(0, 0, width, height, 'clouds');
        this.clouds.setOrigin(0, 0);
        this.clouds.setTint(0xeeeeee);
        this.clouds.tileScaleX = this.cloudTileScaleX;
        this.clouds.tileScaleY = this.cloudTileScaleY;

        this.add.image(width / 2, height / 2, 'titlescreen');

        this.input.once('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }

    update() {
        // Scroll the clouds horizontally
        this.clouds.tilePositionX += this.cloudScrollSpeed;
    }
}
