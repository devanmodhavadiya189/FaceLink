import { useState, useRef } from 'react';

export const usewebrtc = (socket, username) => {
  const [localstream, setlocalstream] = useState(null);
  const [peerconnection, setpeerconnection] = useState(null);
  const [didioffer, setdidioffer] = useState(false);
  
  const localvideoref = useRef(null);
  const remotevideoref = useRef(null);
  
  const peerconfiguration = {
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
  };

  const getusermedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setlocalstream(stream);
    if (localvideoref.current) localvideoref.current.srcObject = stream;
    return stream;
  };

  const createpc = async (offerobj = null) => {
    const pc = new RTCPeerConnection(peerconfiguration);
    const remotestream = new MediaStream();
    
    if (remotevideoref.current) remotevideoref.current.srcObject = remotestream;
    if (localstream) localstream.getTracks().forEach(track => pc.addTrack(track, localstream));
    
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('sendicecandidatetosignalingserver', {
          icecandidate: event.candidate,
          iceusername: username,
          didioffer
        });
      }
    };
    
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => remotestream.addTrack(track));
    };
    
    if (offerobj) await pc.setRemoteDescription(offerobj.offer);
    setpeerconnection(pc);
    return pc;
  };

  const makecall = async () => {
    await getusermedia();
    const pc = await createpc();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    setdidioffer(true);
    socket.emit('newoffer', offer);
  };

  const answercall = async (offerobj) => {
    await getusermedia();
    const pc = await createpc(offerobj);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    const icecandidates = await socket.emitWithAck('newanswer', { ...offerobj, answer });
    icecandidates.forEach(candidate => pc.addIceCandidate(candidate));
  };

  return { localvideoref, remotevideoref, makecall, answercall, peerconnection };
};