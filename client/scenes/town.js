import Phaser, { Scene } from 'phaser';
import io from 'socket.io-client';

class Town extends Scene {
    constructor() {
        super({ key: 'Town' });
        this.socket = io();
        this.players = {};
        this.isMoving = false;
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'assets/maps/town.json');
        this.load.spritesheet('tilesheet', 'assets/maps/tilesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('sprite', 'assets/sprites/sprite.png')
    }

    create() {
        this.map = this.add.tilemap('map');
        this.tileset = this.map.addTilesetImage('tilesheet');

        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        for (let i = 0; i < this.map.layers.length; i++) {
            this.map.createStaticLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        this.input.on('pointerdown', (event) => {
            this.isMoving = true;
            this.socket.emit('click', { x: event.x, y: event.y });
        });

        this.socket.emit('newPlayer');

        this.socket.on('newPlayer', (data) => {
            this.players[data.id] = this.add.sprite(data.x, data.y, 'sprite');
        });

        this.socket.on('allPlayers', (data) => {
            for (let i = 0; i < data.length; i++) {
                this.players[data[i].id] = this.add.sprite(data[i].x, data[i].y, 'sprite');
            }
        });

        this.socket.on('move', (data) => {
            this.players[data.id].x = data.x;
            this.players[data.id].y = data.y;
        });

        this.socket.on('movePlayer', (data) => {
            let player = this.players[data.id];
            let distance = Phaser.Math.Distance.Between(player.x, player.y, data.x, data.y);
            let duration = distance * 10;

            this.tweens.add({
                targets: player,
                x: data.x,
                y: data.y,
                duration: distance * 5,
                onComplete: () => {
                    this.isMoving = false;
                },
            });
        });

        this.socket.on('remove', (id) => {
            this.players[id].destroy();
            delete this.players[id];
        });
    }

    update() {
        if (this.isMoving === false) {
            if (this.keyA.isDown) {
                this.socket.emit('keyPress', 'left');
            }

            if (this.keyD.isDown) {
                this.socket.emit('keyPress', 'right');
            }

            if (this.keyW.isDown) {
                this.socket.emit('keyPress', 'up');
            }

            if (this.keyS.isDown) {
                this.socket.emit('keyPress', 'down');
            }
        }
    }
}

export default Town;
