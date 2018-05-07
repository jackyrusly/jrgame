import Phaser, { Scene } from 'phaser';
import io from 'socket.io-client';

class Town extends Scene {
    constructor() {
        super({ key: 'Town' });
        this.socket = io();
        this.players = {};
        this.layers = {};
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'assets/maps/town.json');
        this.load.spritesheet('tilesheet', 'assets/maps/tilesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.map = this.add.tilemap('map');
        this.tileset = this.map.addTilesetImage('tilesheet');

        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        for (let i = 0; i < this.map.layers.length; i++) {
            this.layers[i] = this.map.createStaticLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        /* River */
        this.layers[6].setCollisionBetween(0, 1021);

        /* House 1 */
        this.layers[7].setCollisionBetween(105, 110);
        this.layers[7].setCollisionBetween(125, 130);
        this.layers[7].setCollisionBetween(145, 150);
        this.layers[7].setCollisionBetween(165, 170);

        /* House 2 */
        this.layers[7].setCollisionBetween(207, 207);
        this.layers[7].setCollisionBetween(226, 228);
        this.layers[7].setCollisionBetween(245, 249);
        this.layers[7].setCollisionBetween(264, 270);
        this.layers[7].setCollisionBetween(284, 290);
        this.layers[7].setCollisionBetween(304, 310);
        this.layers[7].setCollisionBetween(324, 330);
        this.layers[7].setCollisionBetween(344, 350);
        this.layers[7].setCollisionBetween(1661, 1663);

        /* Camps */
        this.layers[8].setCollisionBetween(5, 25);

        /* Trees */
        this.layers[9].setCollisionBetween(213, 215);
        this.layers[9].setCollisionBetween(233, 256);
        this.layers[9].setCollisionBetween(273, 296);

        this.socket.emit('newPlayer');

        this.socket.on('newPlayer', (data) => {
            this.addPlayer(data.id, data.x, data.y);
        });

        this.socket.on('allPlayers', (data) => {
            for (let i = 0; i < data.length; i++) {
                this.addPlayer(data[i].id, data[i].x, data[i].y);
            }

            this.physics.world.setBounds(0, 0, 768, 544);
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.cameras.main.startFollow(this.players[this.socket.id]);
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
            this.players[data.id].body.velocity.x = data.speedX;
            this.players[data.id].body.velocity.y = data.speedY;

            this.players[data.id].anims.play(direction, true);
        });

        this.input.keyboard.on('keyup', (event) => {
            if (event.keyCode === 68 || event.keyCode === 83 || event.keyCode === 65 || event.keyCode === 87) /* A D W S */
                this.socket.emit('stop');
        });

        this.hold(document.getElementById('up'), () => { this.socket.emit('keyPress', 'up', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y }); }, 1000 / 60, 1);
        this.hold(document.getElementById('down'), () => { this.socket.emit('keyPress', 'down', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y }); }, 1000 / 60, 1);
        this.hold(document.getElementById('left'), () => { this.socket.emit('keyPress', 'left', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y }); }, 1000 / 60, 1);
        this.hold(document.getElementById('right'), () => { this.socket.emit('keyPress', 'right', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y }); }, 1000 / 60, 1);

        this.socket.on('stop', (id) => {
            this.players[id].body.velocity.x = 0;
            this.players[id].body.velocity.y = 0;
            this.players[id].anims.stop();
        });

        this.socket.on('remove', (id) => {
            this.players[id].destroy();
            delete this.players[id];
        });
    }

    addPlayer(id, x, y) {
        this.players[id] = this.physics.add.sprite(x, y, 'player');
        this.players[id].setCollideWorldBounds(true);
        this.physics.add.collider(this.players[id], this.layers[6]);
        this.physics.add.collider(this.players[id], this.layers[7]);
        this.physics.add.collider(this.players[id], this.layers[8]);
        this.physics.add.collider(this.players[id], this.layers[9]);
    }

    update() {
        if (this.keyA.isDown) {
            this.socket.emit('keyPress', 'left', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
        } else if (this.keyD.isDown) {
            this.socket.emit('keyPress', 'right', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
        } else if (this.keyW.isDown) {
            this.socket.emit('keyPress', 'up', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
        } else if (this.keyS.isDown) {
            this.socket.emit('keyPress', 'down', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
        }
    }

    hold(btn, action, start, speedup) {
        let t;

        let repeat = () => {
            action();
            t = setTimeout(repeat, start);
            start = start / speedup;
        }

        btn.onmousedown = (e) => {
            e.preventDefault();
            repeat();
        };

        btn.onmouseup = (e) => {
            e.preventDefault();
            clearTimeout(t);
            this.socket.emit('stop');
        };

        btn.ontouchstart = (e) => {
            e.preventDefault();
            repeat();
        };

        btn.ontouchend = (e) => {
            e.preventDefault();
            clearTimeout(t);
            this.socket.emit('stop');
        };
    };
}

export default Town;
