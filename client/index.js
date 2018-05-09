import Phaser, { Game } from 'phaser';
import Init from './scenes/Init';
import Town from './scenes/Town';
import House from './scenes/House';

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
    scene: [Init, Town, House],
};

const game = new Game(config);
