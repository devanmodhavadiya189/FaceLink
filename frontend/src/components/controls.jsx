const Controls = ({ onmakecall, connected, username }) => (
  <div className="controlsection">
    <div className="userinfo">
      <h3>user info</h3>
      <p>username: {username}</p>
      <div className="status">status: {connected ? 'connected' : 'disconnected'}</div>
    </div>
    <div className="controls">
      <button className="btn primary" onClick={onmakecall} disabled={!connected}>
        start call
      </button>
    </div>
  </div>
);

export default Controls;