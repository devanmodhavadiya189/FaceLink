import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const usesocket = () => {
  const [socket, setsocket] = useState(null);
  const [connected, setconnected] = useState(false);
  const [username, setusername] = useState('');
  const [currentroom, setcurrentroom] = useState('');
  const [usercount, setusercount] = useState(0);

  const joinroom = (roomid) => {
    if (socket) {
      socket.disconnect();
    }
    
    const newusername = "user-" + Math.floor(Math.random() * 100000);
    setusername(newusername);
    
    const newsocket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        username: newusername,
        password: import.meta.env.VITE_PASSWORD,
        roomid: roomid
      }
    });
    
    newsocket.on('connect', () => setconnected(true));
    newsocket.on('disconnect', () => {
      setconnected(false);
      setcurrentroom('');
      setusercount(0);
    });
    
    newsocket.on('roomjoined', (data) => {
      setcurrentroom(data.roomid);
      setusercount(data.usercount);
    });
    
    setsocket(newsocket);
  };

  useEffect(() => {
    return () => socket?.disconnect();
  }, [socket]);

  return { socket, connected, username, currentroom, usercount, joinroom };
};