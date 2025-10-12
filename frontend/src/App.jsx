import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import useWebRTC from './hooks/usewebrtc';
import ControlPanel from './components/ControlPanel';
import VideoSection from './components/VideoSection';
import ErrorBoundary from './components/ErrorBoundary';



function App() {
  const [socket, setsocket] = useState(null);
  const [myuserid, setmyuserid] = useState('');
  const [targetuserid, settargetuserid] = useState('');
  const [message, setmessage] = useState('');
  const [incall, setincall] = useState(false);
  const [incomingcall, setincomingcall] = useState(null);
  const [useridset, setuseridset] = useState(false);
  const [onlineusers, setonlineusers] = useState([]);
  
  const webrtc = useWebRTC();
  const { localvideoref, remotevideoref } = webrtc;

  useEffect(() => {
    const newsocket = io(import.meta.env.VITE_BACKEND_URL);
    setsocket(newsocket);

    newsocket.on('connect', () => setmessage('connected - set your user id'));
    newsocket.on('useridset', (data) => { setmessage(`user id: ${data.myuserid}`); setuseridset(true); setonlineusers(data.onlineusers); });
    newsocket.on('useronline', (data) => setonlineusers(prev => [...prev, data.userid]));
    newsocket.on('useroffline', (data) => setonlineusers(prev => prev.filter(id => id !== data.userid)));
    newsocket.on('readytoconnect', (data) => { setmessage(`connecting to ${data.targetuserid}`); handlesetup(); });
    newsocket.on('incomingcall', (data) => { setmessage(`call from ${data.fromuserid}`); setincomingcall(data.fromuserid); });

    return () => { newsocket.disconnect(); webrtc.cleanup(); };
  }, []);

  const handlesetup = async () => {
    const success = await webrtc.setupcall(targetuserid, socket);
    if (success) setincall(true);
  };

  const handlesetmyuserid = () => {
    if (!myuserid.trim() || !socket) return;
    const cleanedid = myuserid.trim().toLowerCase();
    setmyuserid(cleanedid);
    socket.emit('setmyuserid', { myuserid: cleanedid });
  };

  const handleconnecttotarget = (userid) => {
    if (!userid || !socket) return;
    settargetuserid(userid);
    socket.emit('connecttotarget', { targetuserid: userid });
  };

  const testcamera = async () => {
    const success = await webrtc.startcamerapreview();
    if (success) setmessage('camera preview started - camera is working');
  };

  const makecall = () => socket && socket.emit('offer', { targetuserid });
  const acceptcall = () => { handlesetup(); setincomingcall(null); };
  const rejectcall = () => { setincomingcall(null); setmessage('call rejected'); };
  const endcall = () => { setincall(false); settargetuserid(''); webrtc.cleanup(); socket.emit('callended', { targetuserid }); };
  const resetconnection = () => { setuseridset(false); setmyuserid(''); settargetuserid(''); setincall(false); setincomingcall(null); setonlineusers([]); webrtc.cleanup(); };

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="header">
          <h1>facelink video call</h1>
        </div>
        
        <div className="main">
          <VideoSection 
            incall={incall}
            myuserid={myuserid}
            targetuserid={targetuserid}
            localvideoref={localvideoref}
            remotevideoref={remotevideoref}
            localstreamref={webrtc.localstreamref}
          />
          
          <ControlPanel 
            useridset={useridset}
            myuserid={myuserid}
            setmyuserid={setmyuserid}
            onlineusers={onlineusers}
            incall={incall}
            incomingcall={incomingcall}
            message={message}
            handlesetmyuserid={handlesetmyuserid}
            handleconnecttotarget={handleconnecttotarget}
            makecall={makecall}
            acceptcall={acceptcall}
            rejectcall={rejectcall}
            endcall={endcall}
            resetconnection={resetconnection}
            testcamera={testcamera}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
