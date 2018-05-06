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
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 })
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
            this.players[data.id] = this.add.sprite(data.x, data.y, 'player');
        });

        this.socket.on('allPlayers', (data) => {
            for (let i = 0; i < data.length; i++) {
                this.players[data[i].id] = this.add.sprite(data[i].x, data[i].y, 'player');
            }
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
            frameRate: 13,
            repeat: -1
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 13,
            repeat: -1
        });

        this.socket.on('move', (data, direction) => {
            this.players[data.id].x = data.x;
            this.players[data.id].y = data.y;

            this.players[data.id].anims.play(direction, true);
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

        this.input.keyboard.on('keyup', (event) => {
            if (event.keyCode === 68 || event.keyCode === 83 || event.keyCode === 65 || event.keyCode === 87) /* A D W S */
                this.socket.emit('stop');
        });

        this.socket.on('stop', (id) => {
            this.players[id].anims.stop();
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
            } else if (this.keyD.isDown) {
                this.socket.emit('keyPress', 'right');
            } else if (this.keyW.isDown) {
                this.socket.emit('keyPress', 'up');
            } else if (this.keyS.isDown) {
                this.socket.emit('keyPress', 'down');
            }
        }
    }
}

export default Town;
