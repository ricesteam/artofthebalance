import { Boot } from './scenes/Boot';
import { GameScene } from './scenes/GameScene';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 853,
    height: 480,
    backgroundColor: '#222222',
    pixelArt: true,
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
    scene: [Boot, Preloader, MainMenu, GameScene, GameOver],
    plugins: {
        global: [
            {
                key: 'rexOutlinePipeline',
                plugin: OutlinePipelinePlugin,
                start: true,
            },
            // ...
        ],
    },
};

export default new Phaser.Game(config);
