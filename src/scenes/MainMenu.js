import { Scene } from 'phaser';
import { Head } from '../Head';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.cloudScrollSpeed = 0.2; // Adjust the scroll speed as needed
        this.count = 0;

        this.canSkipIntro = false;

        this.interlude =
            'Based on true events from the FUTURE.\n\n' +
            '2050 A.D.\n' +
            'The age of borders has ended. The West has unified into a single, glorious Hegemony—governed by one leader, chosen not by vote, but by volume.\n\n' +
            'A crisis boils.\n\n' +
            'Imported NOODLES flood the markets, plunging the economy into a devastating trade deficit. A DEFICIT!\n\n' +
            'Chaos looms. Hope dissolves.\n\n' +
            'Only one man can save the nation.\n' +
            'Not a legend.\n' +
            'Not a myth.\n\n' +
            'Just one guy.\n\n' +
            'The Supreme Leader.\n\n' +
            '(So I ran out of time and mental energy, but there was supposed to be several epic, BADASS montages of the supreme leader training Karate in the wilderness, fighting bears barehanded, and drinking lava--that sort of stuff. Anyways, use your imagination. Don`t you guys not have imaginations???)\n\n' +
            'CUT-TO First Minister Vance:\n\n' +
            '"Supreme Leader! We have a NOODLE crisis!\n\nWhat shall we do?!"\n\n';
    }

    init() {
        this.plugins.get('rexCrtPipeline').add(this.cameras.main, {
            warpX: 0.05,
            warpY: 0.05,
            scanLineStrength: 0.05,
            scanLineWidth: 1024,
        });
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

        this.title = this.add.image(width / 2, height / 2 - 100, 'title');
        this.tweens.add({
            targets: this.title,
            y: height / 2 - 110,
            duration: 1500,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout',
        });

        this.title.postFX.addShine(0.8, 0.3, 7);

        this.start = this.add
            .text(width / 2, height - 50, 'Press TAX to Begin', {
                fontFamily: 'notjam',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        this.tweens.add({
            targets: this.start,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.input.once('pointerdown', () => {
            this.sound.stopAll();
            this.canSkipIntro = true;
            this.startIntro();
            // this.scene.start('GameOver', { isEnding: false });
        });

        const camera = this.cameras.main;
        camera.postFX.addVignette(0.5, 0.5, 1.7, 1);

        this.outro = this.sound.add('outro', { maxInstances: 1 });
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

        if (this.canSkipIntro && this.input.keyboard.addKey('E').isDown) {
            this.endscene();
        }
    }

    startIntro() {
        const width = this.scale.width;
        const height = this.scale.height;
        const margin = 200;

        this.outro.play();

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
                    .text(width / 2, height + 50, this.interlude, {
                        fontFamily: 'notjam',
                        fontSize: 22,
                        fill: '#ffffff',
                        align: 'left',
                        stroke: '#000000',
                        strokeThickness: 4,
                        wordWrap: { width: width - margin },
                    })
                    .setOrigin(0.5, 0); // Align to the top-center

                this.head = new Head(
                    this,
                    width / 2,
                    height + introText.height + 300
                );
                this.head.setDepth(0);
                this.head.tween.stop();
                this.head.closeEyes();
                this.head.baldImage.setFrame(0);

                this.noodle = this.add.image(
                    width / 2 + 30,
                    this.head.y + 100,
                    'noodle'
                );
                this.noodle.setDepth(2);
                this.noodle.setOrigin(0, 0);

                // Tween to scroll the intro text upwards
                this.tweens.add({
                    targets: [introText, this.head, this.noodle],
                    y: `-=${height + introText.height + 50}`, // Scroll up until off-screen
                    duration: 70000, // Adjust duration for scrolling speed
                    ease: 'Linear',
                    onComplete: () => {
                        introText.destroy();

                        // fadeout the outro music using tween, then stop the music
                        this.tweens.add({
                            targets: this.outro,
                            volume: 0,
                            duration: 500,
                            onComplete: () => {
                                this.sound.stopAll();
                                this.slurpNoodles();
                            },
                        });
                    },
                });
            },
        });

        this.add
            .text(width - 130, height - 20, "Press 'E' to skip.", {
                fontFamily: 'notjam',
                fontSize: 11,
                fill: '#ffffff',
                align: 'left',
            })
            .setDepth(20);
    }

    slurpNoodles() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.sound.play('slurp');
        this.tweens.add({
            targets: this.noodle,
            scaleY: 0, // Shrink on the y-axis
            duration: 1000, // Adjust duration as needed
            ease: 'Linear',
            onComplete: () => {
                this.noodle.destroy();
                this.head.openEyes();
                this.head.startBlinking();
                this.talking();
            },
        });
    }

    talking() {
        const margin = 280;
        const width = this.scale.width;
        const height = this.scale.height;

        const textObject = this.add.text(
            margin,
            height - 50,
            '', // Start with empty text
            {
                fontFamily: 'notjam',
                fontSize: 22,
                fill: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4,
                wordWrap: { width: width - margin },
            }
        );

        const fullText = 'Let me think about it...';
        let charIndex = 0;
        this.head.baldImage.anims.play('talking');

        this.time.addEvent({
            delay: Phaser.Math.Between(25, 100),
            repeat: fullText.length - 1,
            callback: () => {
                textObject.text += fullText[charIndex];
                charIndex++;

                if (charIndex === fullText.length) {
                    this.head.baldImage.anims.stop();
                    // Start the game scene after the typing is complete
                    this.time.delayedCall(1000, () => {
                        this.balding();
                        textObject.destroy();
                    });
                }
            },
            callbackScope: this,
        });
    }

    balding() {
        const height = this.scale.height;

        this.tweens.add({
            targets: this.head,
            y: height,
            duration: 500,
            ease: 'back.easeout',
            delay: 500,
            onComplete: () => {
                this.head.baldImage.anims.play('balding');
                this.time.delayedCall(1000, () => {
                    this.head.baldImage.anims.stop();
                    this.head.baldImage.setFrame(4);
                    this.endscene();
                });
            },
        });
    }

    endscene() {
        const pixelated = this.cameras.main.postFX.addPixelate(-1);
        this.add.tween({
            targets: pixelated,
            duration: 700,
            amount: 40,
            onComplete: () => {
                this.sound.stopAll();
                this.cameras.main.fadeOut(100);
                this.scene.start('GameScene');
            },
        });
    }
}
