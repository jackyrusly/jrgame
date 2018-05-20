import BaseModel from '../utilities/base-model';
import { NEW_PLAYER, ALL_PLAYERS, CHAT, KEY_PRESS, MOVE, STOP, REMOVE } from '../../shared/constants/actions/player';
import { TOWN, HOUSE_1, HOUSE_2 } from '../../shared/constants/scenes';

class Player extends BaseModel {
    static onConnect(io, socket) {
        let player;

        socket.on(NEW_PLAYER, (room, position) => {
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
            io.to(socket.room).emit(CHAT, socket.id.substring(0, 5), message);
        });

        socket.on(KEY_PRESS, (direction, coor) => {
            player.update(direction, coor);
            socket.broadcast.to(socket.room).emit(MOVE, player);
        });

        socket.on(STOP, (coor) => {
            player.updatePosition(coor);
            socket.broadcast.to(socket.room).emit(STOP, player);
        });
    }

    static onDisconnect(io, socket) {
        if (Player.list[socket.room])
            delete Player.list[socket.room][socket.id];

        io.to(socket.room).emit(REMOVE, socket.id);
    }

    constructor(id, position) {
        super(id, position.x, position.y);
        this.direction = position.direction;
    }

    updatePosition(coor) {
        this.x = coor.x;
        this.y = coor.y;
    }

    update(direction, coor) {
        this.updatePosition(coor);
        this.direction = direction;
    }
}

Player.list = {};
Player.list[TOWN] = {};
Player.list[HOUSE_1] = {};
Player.list[HOUSE_2] = {};

export default Player;
