import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        const flagImage = this.add.image(0, 0, 'flag');
        flagImage.setOrigin(0, 0);
        flagImage.displayWidth = this.sys.game.config.width;
        flagImage.displayHeight = this.sys.game.config.height;

        //  A simple progress bar. This is the outline of the bar.
        const horizontalPos = flagImage.displayWidth / 2;
        this.add
            .rectangle(horizontalPos, 440, 468, 32)
            .setStrokeStyle(1, 0x4d65b4);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(
            horizontalPos - 230,
            440,
            4,
            28,
            0x4d65b4
        );

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');

        // Load game assets here
        this.load.spritesheet('player', 'trump_animations.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('maga', 'maga.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('lawyer', 'lawyer2.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet('noodles', 'noodles.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('explosion', 'explosion.png', {
            frameWidth: 48,
            frameHeight: 48,
        });

        this.load.image('background2', 'background2.png');
        this.load.image('distort', 'noiseTexture.png');
        this.load.image('noise2', 'noise2.png');
        this.load.image('plank', 'plank.png');
        this.load.image('title', 'title.png');
        this.load.image('castle', 'neo-whitehouse.png');
        this.load.image('clouds', 'clouds.png');
        this.load.image('clouds3', 'clouds3.png');
        this.load.image('toupee', 'toupee.png');
        this.load.image('blood', 'blood.png');
        this.load.image('meatbomb', 'meatbomb.png');
        this.load.image('bursteffect', 'bursteffect.png');

        // big head
        this.load.spritesheet('head', 'head.png', {
            frameWidth: 1024,
            frameHeight: 1024,
        });
        this.load.image('lefteyelid', 'lefteyelid.png');
        this.load.image('righteyelid', 'righteyelid.png');
        this.load.image('leftiris', 'leftiris.png');
        this.load.image('rightiris', 'rightiris.png');

        this.load.font('retro', 'Expire.otf');

        this.loadSounds();
    }

    loadSounds() {
        this.load.setPath('assets/sfx');
        // load sound
        this.load.audio('china', 'TrumpChina-low.wav');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
