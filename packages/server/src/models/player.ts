import {
  ALL_PLAYERS,
  CHAT,
  HOUSE_1,
  HOUSE_2,
  ICoor,
  IPosition,
  KEY_PRESS,
  MOVE,
  NEW_PLAYER,
  REMOVE,
  STOP,
  TDirection,
  TOWN,
  TScenes,
} from '@jrgame/shared';
import { Server, Socket } from 'socket.io';
import BaseModel from '@utilities/base-model';

class Player extends BaseModel {
  static list: { [key: string]: { [key: string]: Player } } = {
    [TOWN]: {},
    [HOUSE_1]: {},
    [HOUSE_2]: {},
  };
  direction: TDirection;

  static onConnect(io: Server, socket: Socket & { room?: string }) {
    let player: Player;

    socket.on(NEW_PLAYER, (room: TScenes, position: IPosition) => {
      socket.join(room);
      socket.room = room;

      player = new Player(socket.id, position);
      Player.list[room][socket.id] = player;

      let players = [];

      for (let i in Player.list[room]) {
        players.push(Player.list[room][i]);
      }

      socket.emit(ALL_PLAYERS, players);

      socket.broadcast.to(room).emit(NEW_PLAYER, player);
    });

    socket.on(CHAT, (message) => {
      io.to(socket.room!).emit(CHAT, socket.id.substring(0, 5), message);
    });

    socket.on(KEY_PRESS, (direction, coor) => {
      player.update(direction, coor);
      socket.broadcast.to(socket.room!).emit(MOVE, player);
    });

    socket.on(STOP, (coor) => {
      player.updatePosition(coor);
      socket.broadcast.to(socket.room!).emit(STOP, player);
    });
  }

  static onDisconnect(io: Server, socket: Socket & { room?: string }) {
    if (Player.list[socket.room!]) delete Player.list[socket.room!][socket.id];

    io.to(socket.room!).emit(REMOVE, socket.id);
  }

  constructor(id: string, position: IPosition) {
    super(id, position.x, position.y);
    this.direction = position.direction;
  }

  updatePosition(coor: ICoor) {
    this.x = coor.x;
    this.y = coor.y;
  }

  update(direction: TDirection, coor: ICoor) {
    this.updatePosition(coor);
    this.direction = direction;
  }
}

export default Player;
