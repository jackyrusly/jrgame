import Phaser, { Game } from 'phaser';
import Town from './scenes/town';

const config = {
    type: Phaser.AUTO,
    width: 768,
    height: 544,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [Town],
};

const game = new Game(config);
