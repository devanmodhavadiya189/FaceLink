import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function useSocketConnection(webrtc, peerconnectionref) {
  const [socket, setsocket] = useState(null);
  const [message, setmessage] = useState('');
  const [useridset, setuseridset] = useState(false);
  const [onlineusers, setonlineusers] = useState([]);
  const [incomingcall, setincomingcall] = useState(null);
  const [incall, setincall] = useState(false);
  const [targetuserid, settargetuserid] = useState('');

  useEffect(() => {
    const newsocket = io(import.meta.env.VITE_BACKEND_URL);
    setsocket(newsocket);

    newsocket.on('connect', () => setmessage('connected - set your user id'));
    newsocket.on('useridset', (data) => { 
      setmessage(`user id: ${data.myuserid}`); 
      setuseridset(true); 
      setonlineusers(data.onlineusers); 
    });
    newsocket.on('useronline', (data) => setonlineusers(prev => [...prev, data.userid]));
    newsocket.on('useroffline', (data) => setonlineusers(prev => prev.filter(id => id !== data.userid)));
    newsocket.on('readytoconnect', (data) => { 
      setmessage(`ready to connect to ${data.targetuserid} - start call when ready`); 
    });
    newsocket.on('incomingcall', (data) => { 
      setmessage(`call from ${data.fromuserid}`); 
      setincomingcall(data.fromuserid); 
    });
    
    newsocket.on('offer', async (data) => { 
      setmessage('received offer - setting up call...'); 
      if (!peerconnectionref.current) {
        await webrtc.setupcall(data.fromuserid, newsocket);
        setincall(true);
        settargetuserid(data.fromuserid);
      }
      webrtc.handleoffer(data, newsocket); 
    });
    newsocket.on('answer', (data) => { 
      setmessage('received answer - connecting...'); 
      webrtc.handleanswer(data); 
    });
    newsocket.on('icecandidate', (data) => { 
      webrtc.handleicecandidate(data.candidate); 
    });

    return () => { 
      newsocket.disconnect(); 
      webrtc.cleanup(); 
    };
  }, []);

  return {
    socket,
    message,
    setmessage,
    useridset,
    setuseridset,
    onlineusers,
    setonlineusers,
    incomingcall,
    setincomingcall,
    incall,
    setincall,
    targetuserid,
    settargetuserid
  };
}

export default useSocketConnection;
