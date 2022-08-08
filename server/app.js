import express from 'express';
import Bundler from 'parcel-bundler';
import path from 'path';
import http from 'http';
import socket from 'socket.io';
import compression  from 'compression';
import Player from './models/player';

const app = express();
const server = http.Server(app);
const io = socket(server);
const port = process.env.PORT || 4000;

if (port === 4000) {
  const bundler = new Bundler(path.resolve(__dirname, '../client/index.html'));

  app.use(bundler.middleware());
} else {
  app.use(express.static(path.resolve(__dirname, '../dist')));
}

app.use(compression());

server.listen(port, () => {
    console.log(`App now listening on port ${port}`);
});

io.on('connection', function (socket) {
    Player.onConnect(io, socket);

    socket.on('disconnect', function () {
        Player.onDisconnect(io, socket);
    });
});
