import Phaser, { Game } from 'phaser';
import Town from './scenes/town';

const config = {
    type: Phaser.AUTO,
    width: 350,
    height: 350,
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
