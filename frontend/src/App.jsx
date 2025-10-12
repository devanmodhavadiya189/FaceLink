import { useState, useEffect } from 'react';
import { usesocket } from './hooks/usesocket.jsx';
import { usewebrtc } from './hooks/usewebrtc.jsx';
import Videobox from './components/videobox.jsx';
import Controls from './components/controls.jsx';
import Offerlist from './components/offerlist.jsx';
import Roominput from './components/roominput.jsx';

function App() {
  const { socket, connected, username, currentroom, usercount, joinroom } = usesocket();
  const { localvideoref, remotevideoref, makecall, answercall, peerconnection } = usewebrtc(socket, username);
  const [offers, setoffers] = useState([]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('availableoffers', setoffers);
    socket.on('newofferawaiting', (newoffers) => setoffers(prev => [...prev, ...newoffers]));
    socket.on('answerresponse', (offerobj) => peerconnection?.setRemoteDescription(offerobj.answer));
    socket.on('receivedicecandidatefromserver', (candidate) => peerconnection?.addIceCandidate(candidate));
    
    return () => {
      socket.off('availableoffers');
      socket.off('newofferawaiting');
      socket.off('answerresponse');
      socket.off('receivedicecandidatefromserver');
    };
  }, [socket, peerconnection]);

  const handleanswer = (offer) => {
    answercall(offer);
    setoffers(prev => prev.filter(o => o !== offer));
  };

  return (
    <div className="app">
      <div className="header">
        <h1>facelink video call</h1>
      </div>
      <div className="main">
        <div className="videosection">
          <div className="videocontainer">
            <Videobox videoref={localvideoref} label="local" />
            <Videobox videoref={remotevideoref} label="remote" />
          </div>
        </div>
        <div className="controlsection">
          <Roominput onroomjoin={joinroom} currentroom={currentroom} usercount={usercount} />
          <Controls onmakecall={makecall} connected={connected} username={username} />
          <Offerlist offers={offers} onanswerclick={handleanswer} />
        </div>
      </div>
    </div>
  );
}

export default App;
