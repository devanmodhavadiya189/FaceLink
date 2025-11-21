import { useState } from 'react';
import './App.css';
import useWebRTC from './hooks/usewebrtc';
import useSocketConnection from './hooks/usesocketconnection';
import useCallHandlers from './hooks/usecallhandlers';
import ControlPanel from './components/ControlPanel';
import VideoSection from './components/VideoSection';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [myuserid, setmyuserid] = useState('');
  
  const webrtc = useWebRTC();
  const { localvideoref, remotevideoref, peerconnectionref } = webrtc;

  const {
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
  } = useSocketConnection(webrtc, peerconnectionref);

  const {
    handlesetmyuserid,
    handleconnecttotarget,
    testcamera,
    makecall,
    acceptcall,
    rejectcall,
    endcall,
    resetconnection
  } = useCallHandlers(
    socket, 
    webrtc, 
    incomingcall, 
    setincall, 
    settargetuserid, 
    setincomingcall, 
    setmessage, 
    peerconnectionref
  );

  const onSetMyUserId = () => {
    const cleanedid = handlesetmyuserid(myuserid);
    if (cleanedid) setmyuserid(cleanedid);
  };

  const onResetConnection = () => {
    resetconnection(setuseridset, setmyuserid, setonlineusers);
  };

  const onMakeCall = () => {
    makecall(targetuserid);
  };

  const onEndCall = () => {
    endcall(targetuserid);
  };

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
            handlesetmyuserid={onSetMyUserId}
            handleconnecttotarget={handleconnecttotarget}
            makecall={onMakeCall}
            acceptcall={acceptcall}
            rejectcall={rejectcall}
            endcall={onEndCall}
            resetconnection={onResetConnection}
            testcamera={testcamera}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
