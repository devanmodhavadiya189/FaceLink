const datastore = require('./datastore');

const handleconnection = (socket, io) => {
  const username = socket.handshake.auth.username;
  const password = socket.handshake.auth.password;
  const roomid = socket.handshake.auth.roomid || 'default';

  if (password !== process.env.PASSWORD) {
    socket.disconnect(true);
    return;
  }

  socket.join(roomid);
  datastore.addsocket(socket.id, username, roomid);

  const roomoffers = datastore.offers.filter(o => o.roomid === roomid);
  if (roomoffers.length) {
    socket.emit('availableoffers', roomoffers);
  }

  socket.emit('roomjoined', { roomid, usercount: io.sockets.adapter.rooms.get(roomid)?.size || 1 });

  socket.on('newoffer', (newoffer) => {
    const offer = datastore.addoffer(username, newoffer, roomid);
    socket.to(roomid).emit('newofferawaiting', [offer]);
  });

  socket.on('newanswer', (offerobj, ackfunction) => {
    const sockettoanswer = datastore.findsocketbyusername(offerobj.offererusername);
    if (!sockettoanswer) {
      return;
    }

    const offertoupdate = datastore.findofferbyofferer(offerobj.offererusername);
    if (!offertoupdate) {
      return;
    }

    ackfunction(offertoupdate.offericecandidates);
    
    const updatedoffer = datastore.updateoffer(offerobj.offererusername, username, offerobj.answer);
    socket.to(sockettoanswer.socketid).emit('answerresponse', updatedoffer);
  });

  socket.on('sendicecandidatetosignalingserver', (icecandidateobj) => {
    const { didioffer, iceusername, icecandidate } = icecandidateobj;

    if (didioffer) {
      const offerinoffers = datastore.findofferbyofferer(iceusername);
      if (offerinoffers) {
        offerinoffers.offericecandidates.push(icecandidate);
        
        if (offerinoffers.answererusername) {
          const sockettosendto = datastore.findsocketbyusername(offerinoffers.answererusername);
          if (sockettosendto) {
            socket.to(sockettosendto.socketid).emit('receivedicecandidatefromserver', icecandidate);
          }
        }
      }
    } else {
      const offerinoffers = datastore.findofferbyanswerer(iceusername);
      if (offerinoffers) {
        const sockettosendto = datastore.findsocketbyusername(offerinoffers.offererusername);
        if (sockettosendto) {
          socket.to(sockettosendto.socketid).emit('receivedicecandidatefromserver', icecandidate);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    datastore.removesocket(socket.id);
  });
};

module.exports = { handleconnection };