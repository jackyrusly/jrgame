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
                    direction: p.direction,
                });
            }

            socket.emit('allPlayers', players);

            socket.broadcast.emit('newPlayer', player);
        });

        socket.on('keyPress', (direction, coor) => {
            player.update(direction, coor);

            io.emit('move', player, direction);
        });

        socket.on('stop', (coor) => {
            player.updatePosition(coor);
            io.emit('stop', player);
        });
    }

    static onDisconnect(io, socket) {
        delete Player.list[socket.id];
        io.emit('remove', socket.id);
    }

    constructor(id) {
        super(id, 280, 280);
        
        this.direction = 'down';
        this.speed = 200;
    }

    updatePosition(coor) {
        this.x = coor.x;
        this.y = coor.y;
    }

    update(direction, coor) {
        this.updatePosition(coor);
        this.direction = direction;

        if (direction === 'left') {
            this.speedX = -this.speed;
            this.speedY = 0;
        }
        else if (direction === 'right') {
            this.speedX = this.speed;
            this.speedY = 0;
        }
        else if (direction === 'up') {
            this.speedX = 0;
            this.speedY = -this.speed;
        }
        else if (direction === 'down') {
            this.speedX = 0;
            this.speedY = this.speed;
        }
    }
}

Player.list = {};

module.exports = Player;
