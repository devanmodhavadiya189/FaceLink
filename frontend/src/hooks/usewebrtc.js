import { useRef } from 'react';

function useWebRTC() {
  const localvideoref = useRef(null);
  const remotevideoref = useRef(null);
  const peerconnectionref = useRef(null);
  const localstreamref = useRef(null);

  const startcamerapreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      localstreamref.current = stream;
      if (localvideoref.current) {
        localvideoref.current.srcObject = stream;
      }
      return true;
    } catch (error) {
      console.error('error starting camera preview:', error);
      return false;
    }
  };

  const setupcall = async (targetuserid, socket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true
      });
      
      localstreamref.current = stream;
      if (localvideoref.current) {
        localvideoref.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerconnectionref.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        console.log('received remote track:', event);
        const [remotestream] = event.streams;
        if (remotevideoref.current) {
          remotevideoref.current.srcObject = remotestream;
          console.log('set remote video stream:', remotestream);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log('sending ice candidate:', event.candidate);
          const candidatedata = {
            candidate: event.candidate.candidate,
            sdpmid: event.candidate.sdpMid,
            sdpmlineindex: event.candidate.sdpMLineIndex
          };
          socket.emit('icecandidate', {
            targetuserid,
            candidate: candidatedata
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ice connection state:', pc.iceConnectionState);
      };

      pc.onconnectionstatechange = () => {
        console.log('connection state:', pc.connectionState);
      };

      return true;
    } catch (error) {
      console.error('error setting up call:', error);
      return false;
    }
  };

  const makecall = async (targetuserid, socket) => {
    if (!peerconnectionref.current || !socket) return;

    try {
      console.log('creating offer for:', targetuserid);
      const offer = await peerconnectionref.current.createOffer();
      await peerconnectionref.current.setLocalDescription(offer);
      
      console.log('sending offer:', offer);
      socket.emit('offer', {
        targetuserid,
        offer
      });
    } catch (error) {
      console.error('error making call:', error);
    }
  };

  const handleoffer = async (offerdata, socket) => {
    if (!peerconnectionref.current || !socket) return;

    try {
      console.log('received offer from:', offerdata.fromuserid, offerdata.offer);
      await peerconnectionref.current.setRemoteDescription(offerdata.offer);
      const answer = await peerconnectionref.current.createAnswer();
      await peerconnectionref.current.setLocalDescription(answer);
      
      console.log('sending answer:', answer);
      socket.emit('answer', {
        targetuserid: offerdata.fromuserid,
        answer
      });
    } catch (error) {
      console.error('error handling offer:', error);
    }
  };

  const handleanswer = async (answerdata) => {
    if (!peerconnectionref.current) return;

    try {
      console.log('received answer from:', answerdata.fromuserid, answerdata.answer);
      await peerconnectionref.current.setRemoteDescription(answerdata.answer);
      console.log('answer processed successfully');
    } catch (error) {
      console.error('error handling answer:', error);
    }
  };

  const handleicecandidate = async (candidatedata) => {
    if (!peerconnectionref.current) return;

    try {
      const candidate = new RTCIceCandidate({
        candidate: candidatedata.candidate.candidate,
        sdpMid: candidatedata.candidate.sdpmid,
        sdpMLineIndex: candidatedata.candidate.sdpmlineindex
      });
      await peerconnectionref.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('error handling ice candidate:', error);
    }
  };

  const cleanup = () => {
    if (localstreamref.current) {
      localstreamref.current.getTracks().forEach(track => track.stop());
      localstreamref.current = null;
    }
    if (peerconnectionref.current) {
      peerconnectionref.current.close();
      peerconnectionref.current = null;
    }
    if (localvideoref.current) {
      localvideoref.current.srcObject = null;
    }
    if (remotevideoref.current) {
      remotevideoref.current.srcObject = null;
    }
  };

  return {
    localvideoref,
    remotevideoref,
    localstreamref,
    peerconnectionref,
    startcamerapreview,
    setupcall,
    makecall,
    handleoffer,
    handleanswer,
    handleicecandidate,
    cleanup
  };
}

export default useWebRTC;