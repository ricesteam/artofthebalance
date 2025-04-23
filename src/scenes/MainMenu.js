import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.cloudScrollSpeed = 0.2; // Adjust the scroll speed as needed
        this.count = 0;

        this.intrelude =
            '2050 A.D.\n' +
            'The age of borders has ended. The West has unified into a single, glorious Hegemony—governed by one leader, chosen not by vote, but by volume.\n\n' +
            'The Supreme Leader rules with vision, with vanity, and with very large tariffs.\n\n' +
            'But a crisis brews.\n\n' +
            'Noodles.\n' +
            'Cheap. Delicious. Treacherously affordable.\n\n' +
            'Imported by the metric ton, they have flooded the markets—boiling the economy into a crippling trade deficit.\n\n' +
            'Economists are gone. The Tariff Council has dissolved into sobbing.\n\n' +
            'And now… only one man stands between civilization and collapse.\n\n' +
            'Not a legend.\n' +
            'Not a myth.\n\n' +
            'Just one man.\n\n' +
            'The Supreme Leader.\n\n' +
            'And today… he must set the tariff.';
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.clouds = this.add.tileSprite(0, 0, width, height, 'clouds3');
        this.clouds.setOrigin(0, 0);
        this.clouds.setTint(0xdddddd);

        //const flag = this.add.image(width / 2 + 25, 45, 'flag');
        this.flag = this.add.rope(width / 2 + 23, 45, 'flag', null, 50);
        this.flag.setScale(0.25, 0.25);

        const castle = this.add.image(width / 2, height / 2, 'castle');
        castle.preFX.addVignette(0.5, 0.5, 1, 0.5);

        const title = this.add.image(width / 2, height / 2 - 100, 'title');
        this.tweens.add({
            targets: title,
            y: height / 2 - 110,
            duration: 1500,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout',
        });

        title.postFX.addShine(0.8, 0.3, 7);

        const start = this.add
            .text(width / 2, height - 50, 'Press TAX to Begin', {
                fontFamily: 'notjam',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
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
            this.sound.stopAll();
            this.startIntro();
            //this.scene.start('GameScene', { isEnding: true });
        });

        const camera = this.cameras.main;
        camera.postFX.addVignette(0.5, 0.5, 1.7, 1);
    }

    update() {
        // Scroll the clouds horizontally
        this.clouds.tilePositionX += this.cloudScrollSpeed;

        this.count += 0.1;

        let points = this.flag.points;

        // Simulate fabric blowing in the wind using a combination of sine waves
        for (let i = 0; i < points.length; i++) {
            points[i].y =
                Math.sin(i * 0.1 + this.count) * 2 + // Primary wave with randomness
                Math.sin(i * 0.2 + this.count * 0.5) * 4; // Secondary wave with randomness
        }

        this.flag.setDirty();
    }

    startIntro() {
        const width = this.scale.width;
        const height = this.scale.height;
        const margin = 100;

        // Tween to scroll up the title and start text
        this.tweens.add({
            targets: [this.title, this.start],
            y: `-=${height / 2}`, // Scroll up by half the screen height
            alpha: 0, // Fade out
            duration: 1000,
            ease: 'Sine.easeIn',
            onComplete: () => {
                this.title.destroy();
                this.start.destroy();

                // Add the intro text
                const introText = this.add
                    .text(width / 2, height + 50, this.intrelude, {
                        fontFamily: 'notjam',
                        fontSize: 22,
                        fill: '#ffffff',
                        align: 'center',
                        wordWrap: { width: width - margin },
                    })
                    .setOrigin(0.5, 0); // Align to the top-center

                // Tween to scroll the intro text upwards
                this.tweens.add({
                    targets: introText,
                    y: `-=${height + introText.height + 50}`, // Scroll up until off-screen
                    duration: 30000, // Adjust duration for scrolling speed
                    ease: 'Linear',
                    onComplete: () => {
                        introText.destroy();
                        this.scene.start('GameScene'); // Start the game scene after intro
                    },
                });
            },
        });
    }
}
