import { Scene } from 'phaser';
import { Head } from '../Head';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');

        this.endings = [
            {
                text:
                    'The Supreme Leader perished before a single tariff could be decreed.\n\n' +
                    'Historians would later call it “The Briefest Administration in Western Hegemony.”\n\n' +
                    'One moment he was scanning noodle import forecasts… the next, slumped over in a puddle of fiscal uncertainty.\n\n' +
                    'Some claimed it was dumpling-related. Others blamed an aneurysm triggered by complex VAT calculations.\n\n' +
                    'Regardless, no tariffs were issued. No decisions made.\n\n' +
                    'The noodles flowed in unchecked. The deficit grew unchecked.\n' +
                    'The Hegemony crumbled under the weight of its own appetite.\n\n' +
                    'A regime undone not by rebellion… but by ramen.\n\n' +
                    'A tragic end. A soggy legacy.\n\n' +
                    'World Peace emerged...',
            },
            {
                text:
                    'In a stunning act of hesitation—or perhaps enlightenment—the Supreme Leader chose *not* to tariff the noodles.\n\n' +
                    'The Cabinet gasped. The Tariff Council fainted. The National Anthem rewrote itself in confusion.\n\n' +
                    'Noodles poured across the borders unchallenged, undeterred, un-taxed.\n\n' +
                    'Markets surged. Inflation stabilized. The public cheered the affordability of lunch.\n\n' +
                    'But peace came at a terrible cost: credibility.\n\n' +
                    'The Supreme Leader, once a towering icon of economic aggression, was now seen as… soft.\n\n' +
                    'The Wall wept. His bronze statues grew cold.\n\n' +
                    'Within hours, he was overthrown by his own AI toaster, which immediately imposed a 400% gluten tax.\n\n' +
                    'And thus ended the era of mercy.',
            },
            {
                text:
                    'The Supreme Leader did it.\n\n' +
                    'A clean, unapologetic 1000% noodle tariff.\n\n' +
                    'The room erupted in patriotic fireworks. The economy screamed in terror.\n\n' +
                    'Advisors begged for moderation. Economists self-immolated on the steps of the Ministry of Macroeconomics.\n\n' +
                    'But the Supreme Leader just smiled—glistening, radiant, unbothered.\n\n' +
                    '“A perfect number,” he whispered, as a golden portrait of himself eating nothing materialized behind him.\n\n' +
                    'Noodles vanished from shelves. Black markets flourished. Bartering returned.\n\n' +
                    'The people resorted to flavoring boiled towels with soy sauce.\n\n' +
                    'Civil unrest grew, but so did his approval rating—from 34% to 1,000%, according to Official Math.\n\n' +
                    'The regime celebrated.\n' +
                    'The people starved.\n\n' +
                    'Balance was never the goal. Greatness was.',
            },
            {
                text:
                    'The tariff was bold. Assertive. Moderately outrageous.\n\n' +
                    'At 147%, the Supreme Leader was pleased. Not ecstatic—pleased. The best kind of pleased.\n\n' +
                    'Trade slowed, but didn’t collapse. Noodles became rare, but not mythical.\n\n' +
                    'Citizens lined up for rationed bowls with tears in their eyes and pride in their hearts.\n\n' +
                    '“We suffer… correctly,” one weeping patriot declared.\n\n' +
                    'The economy stabilized. Approval ratings soared.\n\n' +
                    'Foreign leaders wept and applauded simultaneously.\n\n' +
                    'The Wall flexed. The skies cleared.\n\n' +
                    'For the first time in decades, the Supreme Leader nodded.\n\n' +
                    'Balance had been struck. The noodle had been mastered.\n\n' +
                    'History would remember this day—not for its cruelty, nor its mercy…\n\n' +
                    'Glory to the West\n\n' +
                    'Glory to the Supreme Leader',
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

        this.plugins.get('rexCrtPipeline').add(this.cameras.main, {
            warpX: 0.05,
            warpY: 0.05,
            scanLineStrength: 0.05,
            scanLineWidth: 1024,
        });

        // Access the data passed from the previous scene
        this.balanceMeter = data.balanceMeter;
        this.isEnding = data.isEnding ?? false;
        this.endingId = data.endingId ?? 1;
        this.mainText =
            this.isEnding && this.endingId === 3 ? 'Victory' : 'Game Over';
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        const width = this.scale.width;
        const height = this.scale.height;

        // Create the Head instance
        this.head = new Head(this, width / 2, height / 2);
        this.head.setDepth(0);
        this.head.tween.stop(); // Stop the wobbly tween from GameScene

        if (this.endingId != 3) {
            this.head.eyesGoRound();
            this.head.baldImage.setFrame(5);
            this.sound.play('gameover', { maxInstances: 1 });
            this.time.delayedCall(1000, () => {
                this.sound.play('fart', { maxInstances: 1 });
                this.sound.play('fired', { maxInstances: 1, volume: 2 });
            });
        } else {
            this.sound.play('victory', { maxInstances: 1, volume: 0.5 });
            this.head.baldImage.setFrame(1);
        }

        const floatingHead = this.tweens.add({
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
                fontFamily: 'notjam',
                fontSize: 64,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center',
            })
            .setOrigin(0.5);

        if (this.isEnding) {
            floatingHead.stop();
            this.playEnding(gameOver);
        }

        this.input.once('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('MainMenu');
        });

        this.musicTracks = [
            this.sound.add('outro', { maxInstances: 1 }),
            this.sound.add('goldthread', { maxInstances: 1 }),
            this.sound.add('ageoftrump', { maxInstances: 1 }),
            this.sound.add('hegemony', { maxInstances: 1 }),
            this.sound.add('lordoftariffs', { maxInstances: 1 }),
            this.sound.add('onehand', { maxInstances: 1 }),
        ];
    }

    playRandomMusic() {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.stop();
        }

        const availableTracks = this.musicTracks.filter(
            (track) => !track.isPlaying
        );

        if (availableTracks.length === 0) {
            // All tracks are playing or there are no tracks
            return;
        }

        this.currentMusic = Phaser.Utils.Array.GetRandom(availableTracks);
        this.currentMusic.play();

        // Set up a listener to play the next random track when the current one finishes
        this.currentMusic.once('complete', this.playRandomMusic, this);
    }

    playEnding(gameOver) {
        const width = this.scale.width;
        const height = this.scale.height;
        const margin = 200;

        const disclaimerText =
            '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n' +
            'This game was NOT written by AI.' +
            '\n\n\n\n\n\n\n\n' +
            'Code By AI\nArt by AI\nMusic by AI\nStory by AI';

        // Add a delayed call to start scrolling the text
        this.time.delayedCall(2000, () => {
            this.playRandomMusic();
            const endingText = this.add
                .text(
                    width / 2,
                    height + 50,
                    this.endings[this.endingId].text + disclaimerText,
                    {
                        fontFamily: 'notjam',
                        fontSize: 22,
                        fill: '#ffffff',
                        align: 'center',
                        //stroke: '#000000',
                        //strokeThickness: 4,
                        wordWrap: { width: width - margin }, // Wrap text within the screen width
                    }
                )
                .setOrigin(0.5, 0); // Align to the top-center

            //how do I use the image 'lawyer'? ai!
            const lawyer = this.add.image(
                margin,
                endingText.height + 50,
                lawyer
            );

            // Tween to scroll the text and head upwards
            this.tweens.add({
                targets: [endingText, gameOver, this.head, lawyer], // Include the head in the tween
                y: `-=${height + endingText.height + 50}`, // Scroll up until both are off-screen
                duration: 10000, // Adjust duration for scrolling speed
                ease: 'Linear',
                onComplete: () => {
                    endingText.destroy();
                    gameOver.destroy();
                    this.head.destroy();
                    //this.playOutro2();
                },
            });
        });
    }

    // do not change this
    playOutro2() {
        const width = this.scale.width;
        const height = this.scale.height;
        const margin = 200;
        const endingText = this.add
            .text(
                width / 2,
                height + 50,
                'This game was NOT written by AI.\n\n\n\n\n\n\n\nCode By AI\nArt by AI\nMusic by AI\nStory by AI',
                {
                    fontFamily: 'notjam',
                    fontSize: 22,
                    fill: '#ffffff',
                    align: 'center',
                    wordWrap: { width: width - margin }, // Wrap text within the screen width
                }
            )
            .setOrigin(0.5, 0);
        this.tweens.add({
            targets: [endingText], // Include the head in the tween
            y: `-=${height + endingText.height + 50}`, // Scroll up until both are off-screen
            duration: 30000, // Adjust duration for scrolling speed
            ease: 'Linear',
            onComplete: () => {
                endingText.destroy();
                this.playOutro3();
            },
        });
    }

    playOutro3() {
        const width = this.scale.width;
        const height = this.scale.height;
        const margin = 200;
        // do not change this text!
        this.add
            .text(width / 2, height / 2, '"Thanks for playing" -- AI', {
                fontFamily: 'notjam',
                fontSize: 22,
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: width - margin },
            })
            .setOrigin(0.5);
    }
}
