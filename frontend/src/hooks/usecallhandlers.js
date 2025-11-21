function useCallHandlers(socket, webrtc, incomingcall, setincall, settargetuserid, setincomingcall, setmessage, peerconnectionref) {
  const handlesetmyuserid = (myuserid) => {
    if (!myuserid.trim() || !socket) return;
    const cleanedid = myuserid.trim().toLowerCase();
    socket.emit('setmyuserid', { myuserid: cleanedid });
    return cleanedid;
  };

  const handleconnecttotarget = async (userid) => {
    if (!userid || !socket) return;
    settargetuserid(userid);
    
    const success = await webrtc.setupcall(userid, socket);
    if (success) {
      setincall(true);
      socket.emit('connecttotarget', { targetuserid: userid });
    }
  };

  const testcamera = async () => {
    const success = await webrtc.startcamerapreview();
    if (success) setmessage('camera preview started - camera is working');
  };

  const makecall = async (targetuserid) => {
    if (socket && peerconnectionref.current) {
      setmessage('starting call...');
      await webrtc.makecall(targetuserid, socket);
    }
  };

  const acceptcall = async () => {
    const success = await webrtc.setupcall(incomingcall, socket);
    if (success) {
      setincall(true);
      settargetuserid(incomingcall);
    }
    setincomingcall(null);
  };

  const rejectcall = () => { 
    setincomingcall(null); 
    setmessage('call rejected'); 
  };

  const endcall = (targetuserid) => { 
    setincall(false); 
    settargetuserid(''); 
    webrtc.cleanup(); 
    socket.emit('callended', { targetuserid }); 
  };

  const resetconnection = (setuseridset, setmyuserid, setonlineusers) => { 
    setuseridset(false); 
    setmyuserid(''); 
    settargetuserid(''); 
    setincall(false); 
    setincomingcall(null); 
    setonlineusers([]); 
    webrtc.cleanup(); 
  };

  return {
    handlesetmyuserid,
    handleconnecttotarget,
    testcamera,
    makecall,
    acceptcall,
    rejectcall,
    endcall,
    resetconnection
  };
}

export default useCallHandlers;
