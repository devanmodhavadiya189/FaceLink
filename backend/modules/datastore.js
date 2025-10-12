const offers = [];
const connectedsockets = [];

const addoffer = (username, offer) => {
  offers.push({
    offererusername: username,
    offer: offer,
    offericecandidates: [],
    answererusername: null,
    answer: null,
    answericecandidates: []
  });
  return offers[offers.length - 1];
};

const findofferbyofferer = (username) => {
  return offers.find(o => o.offererusername === username);
};

const findofferbyanswerer = (username) => {
  return offers.find(o => o.answererusername === username);
};

const updateoffer = (offererusername, answerusername, answer) => {
  const offer = findofferbyofferer(offererusername);
  if (offer) {
    offer.answer = answer;
    offer.answererusername = answerusername;
  }
  return offer;
};

const addicecandidatetoofferer = (username, icecandidate) => {
  const offer = findofferbyofferer(username);
  if (offer) {
    offer.offericecandidates.push(icecandidate);
  }
  return offer;
};

const addsocket = (socketid, username) => {
  const existinguser = connectedsockets.find(s => s.username === username);
  if (existinguser) {
    return { success: false, message: 'username already taken' };
  }
  
  connectedsockets.push({
    socketid: socketid,
    username: username
  });
  return { success: true, message: 'user connected' };
};

const findsocketbyusername = (username) => {
  return connectedsockets.find(s => s.username === username);
};

const removesocket = (socketid) => {
  const index = connectedsockets.findIndex(s => s.socketid === socketid);
  if (index > -1) {
    connectedsockets.splice(index, 1);
  }
};

const checktargetuser = (targetusername) => {
  return connectedsockets.find(s => s.username === targetusername);
};

const getallusers = () => {
  return connectedsockets.map(s => s.username);
};

module.exports = {
  offers,
  connectedsockets,
  addoffer,
  findofferbyofferer,
  findofferbyanswerer,
  updateoffer,
  addicecandidatetoofferer,
  addsocket,
  findsocketbyusername,
  removesocket,
  checktargetuser,
  getallusers
};