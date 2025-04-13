import { Start } from './scenes/Start.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 640,
    height: 480,
    backgroundColor: '#222222',
    pixelArt: false,
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.5 },
            debug: true,
        },
    },
};

new Phaser.Game(config);
