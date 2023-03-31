/* eslint-disable-next-line */
import init from 'module-alias';
/* eslint-disable-next-line */
import path from 'path';

init({
  base: path.resolve(__dirname, '../package.json'),
});

import { createServer } from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import Player from '@models/player';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 4000;

app.use(express.static(path.resolve(__dirname, '../../client/dist')));

server.listen(port, () => {
  console.log(`App now listening on port ${port}`);
});

io.on('connection', function (socket: Socket) {
  Player.onConnect(io, socket);

  socket.on('disconnect', function () {
    Player.onDisconnect(io, socket);
  });
});
