import { Boot } from './scenes/Boot';
import { GameScene } from './scenes/GameScene';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import SwirlPipelinePlugin from 'phaser3-rex-plugins/plugins/swirlpipeline-plugin.js';
import ShockwavePipelinePlugin from 'phaser3-rex-plugins/plugins/shockwavepipeline-plugin.js';
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilterpipeline-plugin.js';
import CrtPipelinePlugin from 'phaser3-rex-plugins/plugins/crtpipeline-plugin.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    title: 'The Art of the Balance',
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
            //debug: true,
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
            {
                key: 'rexShockwavePipeline',
                plugin: ShockwavePipelinePlugin,
                start: true,
            },
            {
                key: 'rexSwirlPipeline',
                plugin: SwirlPipelinePlugin,
                start: true,
            },
            {
                key: 'rexGlowFilterPipeline',
                plugin: GlowFilterPipelinePlugin,
                start: true,
            },
            {
                key: 'rexCrtPipeline',
                plugin: CrtPipelinePlugin,
                start: true,
            },
        ],
    },
};

export default new Phaser.Game(config);
