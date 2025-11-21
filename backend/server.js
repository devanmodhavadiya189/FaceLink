require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const http = require('http');
const { handlesetmyuserid, handleconnecttotarget, handledisconnect } = require('./handlers/userhandlers');
const { handleoffer, handleanswer, handleicecandidate } = require('./handlers/webrtchandlers');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  socket.on('setmyuserid', handlesetmyuserid(socket, users, io));
  socket.on('connecttotarget', handleconnecttotarget(socket, users, io));
  socket.on('offer', handleoffer(socket, users, io));
  socket.on('answer', handleanswer(socket, users, io));
  socket.on('icecandidate', handleicecandidate(socket, users, io));
  socket.on('disconnect', handledisconnect(socket, users));
});

const port = process.env.PORT || 8181;
server.listen(port, () => {
  console.log(`server running on port ${port}`);
});