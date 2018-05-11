const BaseModel = require('../utils/base-model');

class Player extends BaseModel {
    static onConnect(io, socket) {
        let player = new Player(socket.id);

        socket.on('chat', (message) => {
            io.emit('chat', socket.id.substring(0, 5), message);
        });

        socket.on('newPlayer', (room) => {
            socket.join(room);
            socket.room = room;

            if (room == 'House') {
                player.x = 240;
                player.y = 365;
                player.direction = 'up';
            }

            Player.list[room][socket.id] = player;

            let players = [];

            for (let i in Player.list[room]) {
                let p = Player.list[room][i];

                players.push({
                    id: p.id,
                    x: p.x,
                    y: p.y,
                    direction: p.direction,
                });
            }

            socket.emit('allPlayers', players);

            socket.broadcast.to(room).emit('newPlayer', player);
        });

        socket.on('keyPress', (direction, coor) => {
            player.update(direction, coor);
            socket.broadcast.to(socket.room).emit('move', player, direction);
        });

        socket.on('stop', (coor) => {
            player.updatePosition(coor);
            socket.broadcast.to(socket.room).emit('stop', player);
        });
    }

    static onDisconnect(io, socket) {
        if (Player.list[socket.room])
            delete Player.list[socket.room][socket.id];

        io.to(socket.room).emit('remove', socket.id);
    }

    constructor(id) {
        super(id, 225, 280);

        this.direction = 'down';
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

Player.list = {
    'Town': {},
    'House': {},
};

module.exports = Player;
