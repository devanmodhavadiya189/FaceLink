require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const { handleconnection } = require('./modules/sockethandler');

const app = express();

app.use(cors());
app.use(express.static(__dirname));

let server;
let io;

server = require('http').createServer(app);

io = socketio(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL_1,
      process.env.FRONTEND_URL_2,
      process.env.FRONTEND_URL_3,
      process.env.FRONTEND_URL_4
    ],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  handleconnection(socket, io);
});

const port = process.env.PORT || 8181;
server.listen(port, () => {
  console.log(`server running on port ${port}`);
});

module.exports = { app, server, io };