import io from 'socket.io-client';
import { NEW_PLAYER, ALL_PLAYERS, CHAT, KEY_PRESS, MOVE, STOP, REMOVE } from '../../shared/constants/actions/player';
import { UP, LEFT, DOWN, RIGHT } from '../../shared/constants/directions';
import { IMAGE_PLAYER } from '../constants/assets';
import { SPEED } from '../constants/player';
import { FADE_DURATION } from '../constants/config';

class Player {
    constructor(scene, room, position) {
        this.scene = scene;
        this.room = room;
        this.position = position;

        this.socket = io();
        this.players = {};
        this.transition = true;
        this.timeout = 1000 / 60;
        this.scene.input.keyboard.removeAllListeners();

        this.scene.scene.setVisible(false, room);
    }

    create() {
        this.scene.keyLeft = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.scene.keyRight = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.scene.keyUp = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.scene.keyDown = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        this.socket.emit(NEW_PLAYER, this.room, this.position);

        this.socket.on(NEW_PLAYER, (data) => {
            this.addPlayer(data.id, data.x, data.y, data.direction);
        });

        this.socket.on(ALL_PLAYERS, (data) => {
            this.scene.cameras.main.fadeFrom(FADE_DURATION);
            this.scene.scene.setVisible(true, this.room);

            for (let i = 0; i < data.length; i++) {
                this.addPlayer(data[i].id, data[i].x, data[i].y, data[i].direction);
            }

            this.scene.physics.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
            this.scene.cameras.main.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
            this.scene.cameras.main.startFollow(this.players[this.socket.id]);
            this.scene.registerCollision(this.socket.id);

            this.scene.cameras.main.on('camerafadeincomplete', () => {
                this.transition = false;

                this.socket.on(MOVE, (data) => {
                    this.players[data.id].x = data.x;
                    this.players[data.id].y = data.y;
                    this.players[data.id].anims.play(data.direction, true);
                });

                this.scene.input.keyboard.on('keyup', (event) => {
                    if (event.keyCode >= 37 && event.keyCode <= 40) {
                        this.stop();
                    }
                });

                this.hold(document.getElementById('up'), this.up.bind(this));
                this.hold(document.getElementById('down'), this.down.bind(this));
                this.hold(document.getElementById('left'), this.left.bind(this));
                this.hold(document.getElementById('right'), this.right.bind(this));

                this.registerChat();

                this.socket.on(STOP, (data) => {
                    this.players[data.id].x = data.x;
                    this.players[data.id].y = data.y;
                    this.players[data.id].anims.stop();
                });

                this.socket.on(REMOVE, (id) => {
                    this.players[id].destroy();
                    delete this.players[id];
                });

                this.scene.cameras.main.on('camerafadeoutcomplete', () => {
                    this.scene.changeScene();
                });
            });
        });
    }

    update() {
        if (this.transition === false) {
            if (this.scene.keyLeft.isDown) {
                this.left();
            } else if (this.scene.keyRight.isDown) {
                this.right();
            } else if (this.scene.keyUp.isDown) {
                this.up();
            } else if (this.scene.keyDown.isDown) {
                this.down();
            }
        }
    }

    addPlayer(id, x, y, direction) {
        this.players[id] = this.scene.physics.add.sprite(x, y, IMAGE_PLAYER);
        this.players[id].setCollideWorldBounds(true);

        this.players[id].anims.play(direction);
        this.players[id].anims.stop();
    }

    left() {
        this.players[this.socket.id].body.velocity.x = -SPEED;
        this.players[this.socket.id].anims.play(LEFT, true);
        this.socket.emit(KEY_PRESS, LEFT, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    right() {
        this.players[this.socket.id].body.velocity.x = SPEED;
        this.players[this.socket.id].anims.play(RIGHT, true);
        this.socket.emit(KEY_PRESS, RIGHT, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    up() {
        this.players[this.socket.id].body.velocity.y = -SPEED;
        this.players[this.socket.id].anims.play(UP, true);
        this.socket.emit(KEY_PRESS, UP, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    down() {
        this.players[this.socket.id].body.velocity.y = SPEED;
        this.players[this.socket.id].anims.play(DOWN, true);
        this.socket.emit(KEY_PRESS, DOWN, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    stop() {
        this.players[this.socket.id].body.velocity.x = 0;
        this.players[this.socket.id].body.velocity.y = 0;
        this.players[this.socket.id].anims.stop();

        this.socket.emit(STOP, { x: this.players[this.socket.id].x, y: this.players[this.socket.id].y });
    }

    hold(btn, action) {
        let t;

        let repeat = () => {
            action();
            t = setTimeout(repeat, this.timeout);
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

    registerChat() {
        let chat = document.getElementById(CHAT);
        let messages = document.getElementById('messages');

        chat.onsubmit = (e) => {
            e.preventDefault();
            let message = document.getElementById('message');

            this.socket.emit(CHAT, message.value);
            message.value = '';
        };

        this.socket.on(CHAT, (name, message) => {
            messages.innerHTML += `${name}: ${message}<br>`;
            messages.scrollTo(0, messages.scrollHeight);
        });
    }
}

export default Player;
