import { Scene } from 'phaser';
import {
  ALL_PLAYERS,
  CHAT,
  DOWN,
  IPosition,
  KEY_PRESS,
  LEFT,
  MOVE,
  NEW_PLAYER,
  REMOVE,
  RIGHT,
  STOP,
  TDirection,
  TScenes,
  UP,
} from '@jrgame/shared';
import io, { Socket } from 'socket.io-client';
import { IMAGE_PLAYER } from '@constants/assets';
import { FADE_DURATION } from '@constants/config';
import { SPEED } from '@constants/player';
import BaseScene from '@utilities/base-scene';

class Player {
  scene: BaseScene;
  socket: Socket;
  room: TScenes;
  position: IPosition;
  players: {
    [key: string]: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
      username?: Phaser.GameObjects.Text;
    };
  };

  constructor(scene: BaseScene, room: TScenes, position: IPosition) {
    this.scene = scene;
    this.room = room;
    this.position = position;
    this.socket = io();
    this.players = {};
  }

  create() {
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

      this.scene.physics.world.setBounds(
        0,
        0,
        this.scene.map.widthInPixels,
        this.scene.map.heightInPixels,
      );
      this.scene.cameras.main.setBounds(
        0,
        0,
        this.scene.map.widthInPixels,
        this.scene.map.heightInPixels,
      );
      this.scene.cameras.main.startFollow(this.players[this.socket.id], true);
      this.players[this.socket.id].setCollideWorldBounds(true);

      this.socket.on(MOVE, (data) => {
        this.players[data.id].x = data.x;
        this.players[data.id].y = data.y;
        this.players[data.id].username!.x = data.x - 25;
        this.players[data.id].username!.y = data.y - 35;
        this.players[data.id].anims.play(data.direction, true);
      });

      this.socket.on(STOP, (data) => {
        this.players[data.id].x = data.x;
        this.players[data.id].y = data.y;
        this.players[data.id].anims.stop();
      });

      this.socket.on(REMOVE, (id) => {
        this.players[id].destroy();
        this.players[id].username!.destroy();
        delete this.players[id];
      });

      this.registerChat();
    });
  }

  addPlayer(id: string, x: number, y: number, direction: TDirection) {
    this.players[id] = this.scene.physics.add.sprite(x, y, IMAGE_PLAYER);
    this.players[id].username = this.scene.add.text(
      x - 25,
      y - 35,
      id.slice(0, 5),
    );
    this.players[id].anims.play(direction);
    this.players[id].anims.stop();
  }

  left() {
    this.players[this.socket.id].username!.x =
      this.players[this.socket.id].x - 30;
    this.players[this.socket.id].body.velocity.x = -SPEED;
    this.players[this.socket.id].body.velocity.y = 0;
    this.players[this.socket.id].anims.play(LEFT, true);
    this.socket.emit(KEY_PRESS, LEFT, {
      x: this.players[this.socket.id].x,
      y: this.players[this.socket.id].y,
    });
  }

  right() {
    this.players[this.socket.id].username!.x =
      this.players[this.socket.id].x - 22;
    this.players[this.socket.id].body.velocity.x = SPEED;
    this.players[this.socket.id].body.velocity.y = 0;
    this.players[this.socket.id].anims.play(RIGHT, true);
    this.socket.emit(KEY_PRESS, RIGHT, {
      x: this.players[this.socket.id].x,
      y: this.players[this.socket.id].y,
    });
  }

  up() {
    this.players[this.socket.id].username!.y =
      this.players[this.socket.id].y - 40;
    this.players[this.socket.id].body.velocity.x = 0;
    this.players[this.socket.id].body.velocity.y = -SPEED;
    this.players[this.socket.id].anims.play(UP, true);
    this.socket.emit(KEY_PRESS, UP, {
      x: this.players[this.socket.id].x,
      y: this.players[this.socket.id].y,
    });
  }

  down() {
    this.players[this.socket.id].username!.y =
      this.players[this.socket.id].y - 33;
    this.players[this.socket.id].body.velocity.x = 0;
    this.players[this.socket.id].body.velocity.y = SPEED;
    this.players[this.socket.id].anims.play(DOWN, true);
    this.socket.emit(KEY_PRESS, DOWN, {
      x: this.players[this.socket.id].x,
      y: this.players[this.socket.id].y,
    });
  }

  stop() {
    this.players[this.socket.id].body.velocity.x = 0;
    this.players[this.socket.id].body.velocity.y = 0;
    this.players[this.socket.id].anims.stop();
    this.socket.emit(STOP, {
      x: this.players[this.socket.id].x,
      y: this.players[this.socket.id].y,
    });
  }

  update(direction: {
    isUp: boolean;
    isLeft: boolean;
    isDown: boolean;
    isRight: boolean;
  }) {
    const { isUp, isDown, isLeft, isRight } = direction;

    if (isUp) {
      this.up();
    } else if (isDown) {
      this.down();
    } else if (isLeft) {
      this.left();
    } else if (isRight) {
      this.right();
    } else {
      this.stop();
    }
  }

  registerChat() {
    let chat = document.getElementById(CHAT);
    let messages = document.getElementById('messages')!;

    chat!.onsubmit = (e) => {
      e.preventDefault();
      let message = document.getElementById('message')! as HTMLInputElement;

      this.socket.emit(CHAT, message.value);
      message.value = '';

      const activeElement = document.activeElement! as HTMLElement;

      if (activeElement !== document.body) {
        activeElement.setAttribute('readonly', 'readonly');
        activeElement.setAttribute('disabled', 'true');

        setTimeout(function () {
          activeElement.blur();
          activeElement.removeAttribute('readonly');
          activeElement.removeAttribute('disabled');
        }, 100);
      }
    };

    this.socket.on(CHAT, (name, message) => {
      messages.innerHTML += `${name}: ${message}<br>`;
      messages.scrollTo(0, messages.scrollHeight);
    });
  }
}

export default Player;
