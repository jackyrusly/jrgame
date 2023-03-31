import { Scene } from 'phaser';
import type { ICoor, IPosition, TScenes } from '@jrgame/shared';
import { FADE_DURATION } from '@constants/config';
import Player from '@objects/player';
import TilesetAnimation from './tileset-animation';

class BaseScene extends Scene {
  key: TScenes;
  map!: Phaser.Tilemaps.Tilemap;
  tileset!: Phaser.Tilemaps.Tileset;
  player!: Player;
  transition!: boolean;
  withTSAnimation?: boolean;
  joystick: any;
  layers!: Phaser.Tilemaps.TilemapLayer[];
  isInteracting?: boolean;
  prevSceneKey?: TScenes;
  nextSceneKey?: TScenes;
  tilesetAnimation!: TilesetAnimation;
  keyboard!: {
    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    isUp: () => boolean;
    isLeft: () => boolean;
    isDown: () => boolean;
    isRight: () => boolean;
  };

  constructor(key: TScenes) {
    super({ key });
    this.key = key;
  }

  init(position: IPosition) {
    this.scene.setVisible(false, this.key);
    this.player = new Player(this, this.key, position);
    this.layers = [];
    this.prevSceneKey = this.key;
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

  create(tilemap: string, tileset: string, withTSAnimation: boolean) {
    this.withTSAnimation = withTSAnimation;
    this.map = this.add.tilemap(tilemap);
    this.tileset = this.map.addTilesetImage(tileset);

    for (let i = 0; i < this.map.layers.length; i++) {
      this.layers[i] = this.map.createLayer(
        this.map.layers[i].name,
        this.tileset,
        0,
        0,
      );
    }

    this.player.create();

    this.cameras.main.setBackgroundColor('#222');
    this.cameras.main.on('camerafadeincomplete', () => {
      this.transition = false;

      this.input.keyboard.on('keyup', (event: { keyCode: number }) => {
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
    this.joystick = (this.plugins.get('virtualJoystick') as any).add(this, {
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

    this.input.on('pointerdown', (pointer: ICoor) => {
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
    if (this.withTSAnimation) this.tilesetAnimation.destroy();

    this.player.socket.disconnect();
    this.scene.start(this.nextSceneKey, this.prevSceneKey as Object);
  }

  registerCollision() {
    throw new Error('registerCollision() not implemented');
  }

  registerTilesetAnimation(layer: Phaser.Tilemaps.TilemapLayer) {
    this.tilesetAnimation = new TilesetAnimation();
    this.tilesetAnimation.register(layer, this.tileset.tileData);
    this.tilesetAnimation.start();
  }
}

export default BaseScene;
