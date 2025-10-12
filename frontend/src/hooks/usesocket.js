import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function useSocket(webrtc) {
  const [socket, setsocket] = useState(null);
  const [message, setmessage] = useState('');
  const [useridset, setuseridset] = useState(false);
  const [onlineusers, setonlineusers] = useState([]);
  const [incomingcall, setincomingcall] = useState(null);

  useEffect(() => {
    const newsocket = io(import.meta.env.VITE_BACKEND_URL);
    setsocket(newsocket);

    newsocket.on('connect', () => {
      setmessage('connected to server - please set your user id');
    });

    newsocket.on('error', (errordata) => {
      const errormessage = typeof errordata === 'string' ? errordata : 
                          errordata.message || 'connection error occurred';
      setmessage(`error: ${errormessage}`);
    });

    newsocket.on('useridset', (data) => {
      setmessage(`user id set as: ${data.myuserid}`);
      setuseridset(true);
      setonlineusers(data.onlineusers);
    });

    newsocket.on('useronline', (data) => {
      setonlineusers(prev => [...prev, data.userid]);
    });

    newsocket.on('useroffline', (data) => {
      setonlineusers(prev => prev.filter(id => id !== data.userid));
    });

    newsocket.on('readytoconnect', (data) => {
      setmessage(`ready to connect with ${data.targetuserid}`);
    });

    newsocket.on('incomingcall', (data) => {
      setincomingcall(data.fromuserid);
      setmessage(`incoming call from ${data.fromuserid}`);
    });

    newsocket.on('offer', (data) => {
      if (webrtc) {
        webrtc.handleoffer(data, newsocket);
      }
    });

    newsocket.on('answer', (data) => {
      if (webrtc) {
        webrtc.handleanswer(data);
      }
    });

    newsocket.on('icecandidate', (data) => {
      if (webrtc) {
        webrtc.handleicecandidate(data);
      }
    });

    return () => {
      if (newsocket) {
        newsocket.disconnect();
      }
    };
  }, [webrtc]);

  return {
    socket,
    message,
    setmessage,
    useridset,
    setuseridset,
    onlineusers,
    setonlineusers,
    incomingcall,
    setincomingcall
  };
}

export default useSocket;