import io from 'socket.io-client';
import { ENGINE_METHOD_DIGESTS } from 'constants';

class Player {
    constructor(scene, room) {
        this.s = scene;
        this.room = room;

        this.socket = io();
        this.players = {};
        this.transition = true;
        this.s.input.keyboard.removeAllListeners();
    }

    create() {
        this.s.keyA = this.s.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.s.keyD = this.s.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.s.keyW = this.s.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.s.keyS = this.s.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.socket.emit('newPlayer', this.room);

        this.socket.on('newPlayer', (data) => {
            this.addPlayer(data.id, data.x, data.y, data.direction);
        });

        this.socket.on('allPlayers', (data) => {
            for (let i = 0; i < data.length; i++) {
                this.addPlayer(data[i].id, data[i].x, data[i].y, data[i].direction);
            }

            this.s.physics.world.setBounds(0, 0, this.s.map.widthInPixels, this.s.map.heightInPixels);
            this.s.cameras.main.setBounds(0, 0, this.s.map.widthInPixels, this.s.map.heightInPixels);
            this.s.cameras.main.startFollow(this.players[this.socket.id]);
            this.s.registerCollision(this.socket.id);
        });

        this.socket.on('move', (data, direction) => {
            if (data.id !== this.socket.id) {
                this.players[data.id].x = data.x;
                this.players[data.id].y = data.y;
                this.players[data.id].anims.play(direction, true);
            }
        });

        this.s.input.keyboard.on('keyup', (event) => {
            if (event.keyCode === 68 || event.keyCode === 83 || event.keyCode === 65 || event.keyCode === 87) { /* A D W S */
                this.stop();
            }
        });

        this.hold(document.getElementById('up'), this.up.bind(this), 1000 / 60, 1);
        this.hold(document.getElementById('down'), this.down.bind(this), 1000 / 60, 1);
        this.hold(document.getElementById('left'), this.left.bind(this), 1000 / 60, 1);
        this.hold(document.getElementById('right'), this.right.bind(this), 1000 / 60, 1);

        this.socket.on('stop', (data) => {
            if (data.id !== this.socket.id) {
                this.players[data.id].x = data.x;
                this.players[data.id].y = data.y;
                this.players[data.id].anims.stop();
            }
        });

        this.socket.on('remove', (id) => {
            this.players[id].destroy();
            delete this.players[id];
        });

        this.s.cameras.main.fadeFrom(1000);

        this.s.cameras.main.on('camerafadeincomplete', () => {
            this.transition = false;
        });

        this.s.cameras.main.on('camerafadeoutcomplete', () => {
            this.s.fadeOut();
        });
    }

    update() {
        if (this.transition === false) {
            if (this.s.keyA.isDown) {
                this.left();
            } else if (this.s.keyD.isDown) {
                this.right();
            } else if (this.s.keyW.isDown) {
                this.up();
            } else if (this.s.keyS.isDown) {
                this.down();
            }
        }
    }

    addPlayer(id, x, y, direction) {
        this.players[id] = this.s.physics.add.sprite(x, y, 'player');
        this.players[id].setCollideWorldBounds(true);

        this.players[id].anims.play(direction);
        this.players[id].anims.stop();
    }

    left() {
        this.players[this.socket.id].body.velocity.x = -200;
        this.players[this.socket.id].anims.play('left', true);
        this.socket.emit('keyPress', 'left', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    right() {
        this.players[this.socket.id].body.velocity.x = 200;
        this.players[this.socket.id].anims.play('right', true);
        this.socket.emit('keyPress', 'right', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    up() {
        this.players[this.socket.id].body.velocity.y = -200;
        this.players[this.socket.id].anims.play('up', true);
        this.socket.emit('keyPress', 'up', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    down() {
        this.players[this.socket.id].body.velocity.y = 200;
        this.players[this.socket.id].anims.play('down', true);
        this.socket.emit('keyPress', 'down', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    stop() {
        this.players[this.socket.id].body.velocity.x = 0;
        this.players[this.socket.id].body.velocity.y = 0;
        this.players[this.socket.id].anims.stop();

        this.socket.emit('stop', { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
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

            if (this.transition === false)
                repeat();
        };

        btn.onmouseup = (e) => {
            e.preventDefault();

            if (this.transition === false) {
                clearTimeout(t);
                this.stop();
            }
        };

        btn.ontouchstart = (e) => {
            e.preventDefault();

            if (this.transition === false)
                repeat();
        };

        btn.ontouchend = (e) => {
            e.preventDefault();

            if (this.transition === false) {
                clearTimeout(t);
                this.stop();
            }
        };
    }
}

export default Player;
