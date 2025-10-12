require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const http = require('http');

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

  socket.on('setmyuserid', (data) => {
    const { myuserid } = data;
    console.log(`user setting id: ${myuserid}`);
    
    // Check if this socket already has a userid and clear it
    if (socket.userid && users[socket.userid] === socket.id) {
      delete users[socket.userid];
      socket.broadcast.emit('useroffline', { userid: socket.userid });
    }
    
    if (users[myuserid] && users[myuserid] !== socket.id) {
      socket.emit('error', `userid ${myuserid} already taken`);
      return;
    }
    
    users[myuserid] = socket.id;
    socket.userid = myuserid;
    
    const onlineusers = Object.keys(users).filter(id => id !== myuserid);
    socket.emit('useridset', { myuserid: myuserid, onlineusers: onlineusers });
    
    socket.broadcast.emit('useronline', { userid: myuserid });
    console.log(`user ${myuserid} registered`);
  });

  socket.on('connecttotarget', (data) => {
    const { targetuserid } = data;
    console.log(`${socket.userid} wants to connect to ${targetuserid}`);
    
    if (!socket.userid) {
      socket.emit('error', 'please set your user id first');
      return;
    }
    
    if (socket.userid === targetuserid) {
      socket.emit('error', 'cannot connect to yourself');
      return;
    }
    
    if (users[targetuserid]) {
      const targetsocket = io.sockets.sockets.get(users[targetuserid]);
      if (targetsocket) {
        socket.emit('readytoconnect', { targetuserid });
        targetsocket.emit('incomingcall', { fromuserid: socket.userid });
      } else {
        socket.emit('error', `user ${targetuserid} not available`);
      }
    } else {
      socket.emit('error', `user ${targetuserid} not found`);
    }
  });

  socket.on('offer', (data) => {
    const { targetuserid, offer } = data;
    const targetsocket = io.sockets.sockets.get(users[targetuserid]);
    if (targetsocket) {
      targetsocket.emit('offer', { offer, fromuserid: socket.userid });
    }
  });

  socket.on('answer', (data) => {
    const { targetuserid, answer } = data;
    const targetsocket = io.sockets.sockets.get(users[targetuserid]);
    if (targetsocket) {
      targetsocket.emit('answer', { answer, fromuserid: socket.userid });
    }
  });

  socket.on('icecandidate', (data) => {
    const { targetuserid, candidate } = data;
    const targetsocket = io.sockets.sockets.get(users[targetuserid]);
    if (targetsocket) {
      targetsocket.emit('icecandidate', { candidate, fromuserid: socket.userid });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    if (socket.userid) {
      delete users[socket.userid];
      socket.broadcast.emit('useroffline', { userid: socket.userid });
    }
  });
});

const port = process.env.PORT || 8181;
server.listen(port, () => {
  console.log(`server running on port ${port}`);
});