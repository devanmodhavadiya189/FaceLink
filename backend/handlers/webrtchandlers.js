const handleoffer = (socket, users, io) => (data) => {
  const { targetuserid, offer } = data;
  const targetsocket = io.sockets.sockets.get(users[targetuserid]);
  if (targetsocket) {
    targetsocket.emit('offer', { offer, fromuserid: socket.userid });
  }
};

const handleanswer = (socket, users, io) => (data) => {
  const { targetuserid, answer } = data;
  const targetsocket = io.sockets.sockets.get(users[targetuserid]);
  if (targetsocket) {
    targetsocket.emit('answer', { answer, fromuserid: socket.userid });
  }
};

const handleicecandidate = (socket, users, io) => (data) => {
  const { targetuserid, candidate } = data;
  const targetsocket = io.sockets.sockets.get(users[targetuserid]);
  if (targetsocket) {
    targetsocket.emit('icecandidate', { candidate, fromuserid: socket.userid });
  }
};

module.exports = {
  handleoffer,
  handleanswer,
  handleicecandidate
};
