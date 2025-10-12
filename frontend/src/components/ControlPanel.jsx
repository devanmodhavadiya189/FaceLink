function ControlPanel({ 
  useridset, 
  incall, 
  myuserid, 
  setmyuserid, 
  onlineusers, 
  incomingcall, 
  message,
  handlesetmyuserid,
  handleconnecttotarget,
  makecall,
  endcall,
  acceptcall,
  rejectcall,
  resetconnection,
  testcamera
}) {
  return (
    <div className="controlsection">
      {!useridset && !incall && (
        <div className="userinput">
          <h3>step 1: set your user id</h3>
          <div className="inputgroup">
            <label>my user id:</label>
            <input 
              type="text" 
              value={myuserid}
              onChange={(e) => setmyuserid(e.target.value)}
              placeholder="enter your unique user id"
            />
          </div>
          <button className="btn primary" onClick={handlesetmyuserid}>
            set my id
          </button>
        </div>
      )}

      {useridset && !incall && (
        <div className="userinput">
          <div className="userinfo">
            <p>your id: <strong>{myuserid}</strong></p>
          </div>

          <div className="cameratest">
            <button className="btn secondary" onClick={testcamera}>
              test camera
            </button>
          </div>

          {onlineusers.length > 0 && (
            <div className="onlineusers">
              <h4>online users (click to connect):</h4>
              <div className="userlist">
                {onlineusers.map(userid => (
                  <button 
                    key={userid}
                    className="userbutton"
                    onClick={(e) => {
                      e.preventDefault();
                      handleconnecttotarget(userid);
                    }}
                  >
                    {String(userid)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {incall && (
        <div className="callcontrols">
          <button className="btn primary" onClick={makecall}>
            start call
          </button>
          <button className="btn danger" onClick={endcall}>
            end call
          </button>
        </div>
      )}
      
      {incomingcall && (
        <div className="incomingcall">
          <h4>incoming call from: {incomingcall}</h4>
          <div className="callbuttons">
            <button className="btn primary" onClick={acceptcall}>
              accept
            </button>
            <button className="btn" onClick={rejectcall}>
              reject
            </button>
          </div>
        </div>
      )}
      
      <div className="status">
        <h4>status:</h4>
        <p>{message}</p>
      </div>
      
      <button className="btn resetbutton" onClick={resetconnection}>
        reset connection
      </button>
    </div>
  );
}

export default ControlPanel;