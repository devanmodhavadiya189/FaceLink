const datastore = require('./datastore');

const handleconnection = (socket, io) => {
  const password = socket.handshake.auth.password;

  if (password !== process.env.PASSWORD) {
    console.log(`invalid password`);
    socket.disconnect(true);
    return;
  }

  socket.on('connectuser', (data) => {
    const { myuserid, targetuserid } = data;
    
    console.log(`connection request: ${myuserid} wants to connect to ${targetuserid}`);
    
    if (myuserid === targetuserid) {
      socket.emit('connectionfailed', { message: 'cannot connect to yourself' });
      return;
    }
    
    const existinguser = datastore.findsocketbyusername(myuserid);
    if (existinguser) {
      socket.emit('connectionfailed', { message: `user id '${myuserid}' already taken` });
      return;
    }
    
    const targetuser = datastore.checktargetuser(targetuserid);
    if (!targetuser) {
      socket.emit('connectionfailed', { message: `user '${targetuserid}' not found` });
      return;
    }
    
    const result = datastore.addsocket(socket.id, myuserid);
    if (result.success) {
      console.log(`${myuserid} connected, sending join request to ${targetuserid}`);
      
      socket.emit('connectionestablished', { 
        myuserid,
        targetuserid,
        message: `join request sent to ${targetuserid}` 
      });
      
      socket.to(targetuser.socketid).emit('joinrequest', {
        from: myuserid,
        socketid: socket.id
      });
    }
  });

  socket.on('acceptjoin', (data) => {
    const { fromuserid, offer } = data;
    const accepterusername = datastore.connectedsockets.find(s => s.socketid === socket.id)?.username;
    
    console.log(`${accepterusername} accepting join from ${fromuserid}`);
    
    const fromuser = datastore.findsocketbyusername(fromuserid);
    if (!fromuser) {
      console.log(`user ${fromuserid} not found`);
      return;
    }
    
    const newoffer = datastore.addoffer(accepterusername, offer);
    socket.to(fromuser.socketid).emit('joinaccepted', {
      from: accepterusername,
      offer: newoffer
    });
  });

  socket.on('rejectjoin', (data) => {
    const { fromuserid } = data;
    const rejecterusername = datastore.connectedsockets.find(s => s.socketid === socket.id)?.username;
    
    console.log(`${rejecterusername} rejecting join from ${fromuserid}`);
    
    const fromuser = datastore.findsocketbyusername(fromuserid);
    if (fromuser) {
      socket.to(fromuser.socketid).emit('joinrejected', {
        from: rejecterusername
      });
    }
  });

  socket.on('newanswer', (offerobj, ackfunction) => {
    console.log(`${username} answering call from ${offerobj.offererusername}`);
    
    const sockettoanswer = datastore.findsocketbyusername(offerobj.offererusername);
    if (!sockettoanswer) {
      console.log(`no socket found for offerer: ${offerobj.offererusername}`);
      return;
    }

    const offertoupdate = datastore.findofferbyofferer(offerobj.offererusername);
    if (!offertoupdate) {
      console.log(`no offer found for offerer: ${offerobj.offererusername}`);
      return;
    }

    console.log(`sending ice candidates to ${username}, count: ${offertoupdate.offericecandidates.length}`);
    ackfunction(offertoupdate.offericecandidates);
    
    const updatedoffer = datastore.updateoffer(offerobj.offererusername, username, offerobj.answer);
    console.log(`sending answer response to ${offerobj.offererusername}`);
    socket.to(sockettoanswer.socketid).emit('answerresponse', updatedoffer);
  });

  socket.on('sendicecandidatetosignalingserver', (icecandidateobj) => {
    const { didioffer, iceusername, icecandidate } = icecandidateobj;
    console.log(`ice candidate from ${iceusername}, didioffer: ${didioffer}`);

    if (didioffer) {
      const offerinoffers = datastore.findofferbyofferer(iceusername);
      if (offerinoffers) {
        offerinoffers.offericecandidates.push(icecandidate);
        
        if (offerinoffers.answererusername) {
          const sockettosendto = datastore.findsocketbyusername(offerinoffers.answererusername);
          if (sockettosendto) {
            console.log(`forwarding ice candidate to ${offerinoffers.answererusername}`);
            socket.to(sockettosendto.socketid).emit('receivedicecandidatefromserver', icecandidate);
          }
        }
      }
    } else {
      const offerinoffers = datastore.findofferbyanswerer(iceusername);
      if (offerinoffers) {
        const sockettosendto = datastore.findsocketbyusername(offerinoffers.offererusername);
        if (sockettosendto) {
          console.log(`forwarding ice candidate to ${offerinoffers.offererusername}`);
          socket.to(sockettosendto.socketid).emit('receivedicecandidatefromserver', icecandidate);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    const disconnecteduser = datastore.connectedsockets.find(s => s.socketid === socket.id);
    const username = disconnecteduser ? disconnecteduser.username : 'unknown';
    console.log(`user disconnected: ${username}`);
    datastore.removesocket(socket.id);
  });
};

module.exports = { handleconnection };