const Videobox = ({ videoref, label }) => (
  <div className="videobox">
    <video ref={videoref} autoPlay playsInline muted={label === 'local'} />
    <div className="videolabel">{label}</div>
  </div>
);

export default Videobox;