import { Scene } from 'phaser';
import Player from '../objects/player';
import { FADE_DURATION } from '../constants/config';
import TilesetAnimation from './tileset-animation';

class BaseScene extends Scene {
    constructor(key) {
        super({ key });
        this.key = key;
    }

    init(position) {
        this.scene.setVisible(false, this.key);
        this.player = new Player(this, this.key, position);
        this.layers = {};
        this.prevSceneKey = this.key;
        this.nextSceneKey = null;
        this.transition = true;
        this.input.keyboard.removeAllListeners();
    }

    initKeyboard() {
        const cursorKeys = this.input.keyboard.createCursorKeys();

        this.keyboard = {
            cursorKeys,
            isUp: () => {
                return this.joystick.up || cursorKeys.up.isDown;
            },
            isLeft: () => {
                return this.joystick.left || cursorKeys.left.isDown;
            },
            isDown: () => {
                return this.joystick.down || cursorKeys.down.isDown;
            },
            isRight: () => {
                return this.joystick.right || cursorKeys.right.isDown;
            },
        };
    }

    create(tilemap, tileset, withTSAnimation) {
        this.withTSAnimation = withTSAnimation;
        this.map = this.add.tilemap(tilemap);
        this.tileset = this.map.addTilesetImage(tileset);

        for (let i = 0; i < this.map.layers.length; i++) {
            if (withTSAnimation)
                this.layers[i] = this.map.createDynamicLayer(this.map.layers[i].name, this.tileset, 0, 0);
            else
                this.layers[i] = this.map.createStaticLayer(this.map.layers[i].name, this.tileset, 0, 0);
        }

        this.player.create();

        this.cameras.main.setBackgroundColor('#222');
        this.cameras.main.on('camerafadeincomplete', () => {
            this.transition = false;

            this.input.keyboard.on('keyup', (event) => {
                if (event.keyCode >= 37 && event.keyCode <= 40) {
                    this.player.stop();
                }
            });

            this.registerCollision();
        });

        this.createJoystick();
        this.initKeyboard();
        this.cameras.main.on('camerafadeoutcomplete', this.changeScene.bind(this));
    }

    createJoystick() {
        this.joystick = this.plugins.get('virtualJoystick').add(this, {
            x: 0,
            y: 0,
            radius: 50,
            base: this.add.circle(0, 0, 50, 0x888888, 0.6).setDepth(1),
            thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.8).setDepth(1),
            dir: '4dir',
        });

        this.joystick.setVisible(false);

        this.input.on('pointerup', () => {
            if (!this.isInteracting) {
                this.joystick.setVisible(false);
            }
        });

        this.input.on('pointerdown', (pointer) => {
            if (!this.isInteracting) {
                this.joystick.setPosition(pointer.x, pointer.y);
                this.joystick.update();
                this.joystick.setVisible(true);
            }
        });
    }

    update() {
        if (this.transition === false) {
            this.player.update({
                isUp: this.keyboard.isUp(),
                isDown: this.keyboard.isDown(),
                isLeft: this.keyboard.isLeft(),
                isRight: this.keyboard.isRight(),
            });
        }
    }

    onChangeScene() {
        this.transition = true;
        this.player.stop();
        this.cameras.main.fade(FADE_DURATION);
    }

    changeScene() {
        if (this.withTSAnimation)
            this.tilesetAnimation.destroy();

        this.player.socket.disconnect();
        this.scene.start(this.nextSceneKey, this.prevSceneKey);
    }

    registerCollision() {
        throw new Error('registerCollision() not implemented');
    }

    registerTilesetAnimation(layer) {
        this.tilesetAnimation = new TilesetAnimation();
        this.tilesetAnimation.register(layer, this.tileset.tileData);
        this.tilesetAnimation.start();
    }

    hold(btn, action) {
        let t;
        let repeat = () => { action(); t = setTimeout(repeat, this.timeout); }
        btn.onmousedown = (e) => { e.preventDefault(); if (this.transition === false) repeat(); }
        btn.onmouseup = (e) => { e.preventDefault(); clearTimeout(t); if (this.transition === false) this.player.stop(); }
        btn.ontouchstart = (e) => { e.preventDefault(); if (this.transition === false) repeat(); }
        btn.ontouchend = (e) => { e.preventDefault(); clearTimeout(t); if (this.transition === false) this.player.stop(); }
    }
}

export default BaseScene;
