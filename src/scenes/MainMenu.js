import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.cloudScrollSpeed = 0.2; // Adjust the scroll speed as needed
        this.count = 0; // Initialize count
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // this.clouds = this.add.tileSprite(0, 0, width, height, 'clouds3');
        // this.clouds.setOrigin(0, 0);
        // this.clouds.setTint(0xdddddd);

        //const castle = this.add.image(width / 2, height / 2, 'castle');
        //castle.preFX.addVignette(0.5, 0.5, 1, 0.5);

        //const flag = this.add.image(width / 2 + 25, 45, 'flag');
        this.flag = this.add.rope(width / 2 + 25, 45, 'flag', null, 20);
        this.flag.setScale(0.25, 0.25);

        const title = this.add.image(width / 2, height / 2 - 130, 'title');
        this.tweens.add({
            targets: title,
            y: height / 2 - 110,
            duration: 1500,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout',
        });

        // const fx = this.clouds.preFX.addColorMatrix();

        // const tween = this.tweens.addCounter({
        //     from: 0,
        //     to: 360,
        //     duration: 3000,
        //     loop: -1,
        //     onUpdate: () => {
        //         fx.hue(tween.getValue());
        //     },
        // });

        const start = this.add
            .text(width / 2, height - 150, 'Press TAX to Begin', {
                fontFamily: 'retro',
                fontSize: '32px',
                color: '#ffffff',
            })
            .setOrigin(0.5);

        this.tweens.add({
            targets: start,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.input.once('pointerdown', () => {
            this.scene.start('GameScene');
        });

        const camera = this.cameras.main;
        camera.postFX.addVignette(0.5, 0.5, 1.7, 1);
    }

    update() {
        // Scroll the clouds horizontally
        //this.clouds.tilePositionX += this.cloudScrollSpeed;

        this.count += 0.1;

        let points = this.flag.points;

        for (let i = 0; i < points.length; i++) {
            points[i].y = Math.sin(i * 0.5 + this.count) * 16;
        }

        this.flag.setDirty();
    }
}
