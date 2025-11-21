const handlesetmyuserid = (socket, users, io) => (data) => {
  const { myuserid } = data;
  console.log(`user setting id: ${myuserid}`);
  
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
};

const handleconnecttotarget = (socket, users, io) => (data) => {
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
};

const handledisconnect = (socket, users) => () => {
  console.log('user disconnected:', socket.id);
  if (socket.userid) {
    delete users[socket.userid];
    socket.broadcast.emit('useroffline', { userid: socket.userid });
  }
};

module.exports = {
  handlesetmyuserid,
  handleconnecttotarget,
  handledisconnect
};
