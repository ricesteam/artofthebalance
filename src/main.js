import { Start } from './scenes/Start.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 640,
    height: 480,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

new Phaser.Game(config);
