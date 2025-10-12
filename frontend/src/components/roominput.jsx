import { useState } from 'react';

const Roominput = ({ onroomjoin, currentroom, usercount }) => {
  const [roomid, setroomid] = useState('');

  const handlesubmit = (e) => {
    e.preventDefault();
    if (roomid.trim()) {
      onroomjoin(roomid.trim());
      setroomid('');
    }
  };

  return (
    <div className="roomsection">
      <h3>room connection</h3>
      {currentroom ? (
        <div className="currentroom">
          <p>current room: <strong>{currentroom}</strong></p>
          <p>users in room: {usercount}</p>
        </div>
      ) : (
        <form onSubmit={handlesubmit} className="roomform">
          <input
            type="text"
            value={roomid}
            onChange={(e) => setroomid(e.target.value)}
            placeholder="enter room id"
            className="roominput"
          />
          <button type="submit" className="btn">join room</button>
        </form>
      )}
    </div>
  );
};

export default Roominput;