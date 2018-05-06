const BaseModel = require('../utils/base-model');

class Player extends BaseModel {
    static onConnect(io, socket) {
        let player = new Player(socket.id);
        Player.list[socket.id] = player;

        socket.on('newPlayer', () => {
            let players = [];

            for (let i in Player.list) {
                let p = Player.list[i];

                players.push({
                    id: p.id,
                    x: p.x,
                    y: p.y,
                });
            }

            socket.emit('allPlayers', players);

            socket.broadcast.emit('newPlayer', player);
        });

        socket.on('click', (data) => {
            player.x = data.x;
            player.y = data.y;
            io.emit('movePlayer', player);
        });

        socket.on('keyPress', (data) => {
            player.update(data);
            io.emit('move', player);
        });
    }

    static onDisconnect(io, socket) {
        delete Player.list[socket.id];
        io.emit('remove', socket.id);
    }

    constructor(id) {
        super();
        this.id = id;
        this.speed = 4;
    }

    update(direction) {
        this.updateSpeed(direction);
        super.update();
    }

    updateSpeed(direction) {
        if (direction === 'right')
            this.speedX = this.speed;
        else if (direction === 'left')
            this.speedX = -this.speed;
        else
            this.speedX = 0;

        if (direction === 'up')
            this.speedY = -this.speed;
        else if (direction === 'down')
            this.speedY = this.speed;
        else
            this.speedY = 0;
    }
}

Player.list = {};

module.exports = Player;
