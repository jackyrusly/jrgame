const express = require('express');
const Bundler = require('parcel-bundler');
const path = require('path')
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 4000;
const bundler = new Bundler(path.resolve(__dirname, '../client/index.html'));

app.use(bundler.middleware());

server.listen(port, () => {
    console.log(`App now listening on port ${port}`);
});

const io = require('socket.io')(server);
const Player = require('./models/player');

io.on('connection', function (socket) {
    Player.onConnect(io, socket);

    socket.on('disconnect', function () {
        Player.onDisconnect(io, socket);
    });
});