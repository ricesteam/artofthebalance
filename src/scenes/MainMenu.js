import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.cloudScrollSpeed = 0.2; // Adjust the scroll speed as needed
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.clouds = this.add.tileSprite(0, 0, width, height, 'clouds3');
        this.clouds.setOrigin(0, 0);
        this.clouds.setTint(0xdddddd);

        const castle = this.add.image(width / 2, height / 2, 'castle');
        castle.preFX.addVignette(0.5, 0.5, 1, 0.5);

        const flag = this.add.image(width / 2 + 25, 45, 'flag');
        flag.setScale(0.25, 0.25);

        const title = this.add.image(width / 2, height / 2 - 130, 'title');
        this.tweens.add({
            targets: title,
            y: height / 2 - 110,
            duration: 1500,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout',
        });

        const fx = this.clouds.preFX.addColorMatrix();

        const tween = this.tweens.addCounter({
            from: 0,
            to: 360,
            duration: 3000,
            loop: -1,
            onUpdate: () => {
                fx.hue(tween.getValue());
            },
        });

        this.add.text(width / 2, height - 50, 'Press Tax to Begin', {
            fontFamily: 'retro',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('GameScene');
        });

        const camera = this.cameras.main;
        camera.postFX.addVignette(0.5, 0.5, 1.7, 1);
    }

    update() {
        // Scroll the clouds horizontally
        this.clouds.tilePositionX += this.cloudScrollSpeed;
    }
}
