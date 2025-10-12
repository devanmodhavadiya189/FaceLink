import { useEffect } from 'react';

function VideoSection({ 
  incall, 
  myuserid, 
  targetuserid, 
  localvideoref, 
  remotevideoref,
  localstreamref 
}) {
  // Only start camera when in call or when user is ready to connect
  useEffect(() => {
    const startcamera = async () => {
      if (!incall) return; // Only start camera when actually in a call
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        localstreamref.current = stream;
        if (localvideoref.current) {
          localvideoref.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera error:', error);
      }
    };

    if (incall) {
      startcamera();
    } else {
      // Stop camera when not in call
      if (localstreamref.current) {
        localstreamref.current.getTracks().forEach(track => track.stop());
        localstreamref.current = null;
      }
      if (localvideoref.current) {
        localvideoref.current.srcObject = null;
      }
    }
  }, [incall, localvideoref, localstreamref]);

  return (
    <div className="videosection">
      <div className={`videocontainer ${incall ? 'incall' : ''}`}>
        <div className={`videobox ${incall ? 'incall' : ''}`}>
          <video 
            ref={localvideoref} 
            autoPlay 
            muted 
            playsInline
            controls={false}
            className="video"
            onLoadedMetadata={() => console.log('Local video loaded')}
            onPlaying={() => console.log('Local video playing')}
          />
          <div className="videolabel">{myuserid || 'you'}</div>
        </div>
        
        <div className={`videobox ${incall ? 'incall' : ''}`}>
          <video 
            ref={remotevideoref} 
            autoPlay 
            playsInline
            controls={false}
            className="video"
            onLoadedMetadata={() => console.log('Remote video loaded')}
            onPlaying={() => console.log('Remote video playing')}
          />
          <div className="videolabel">{targetuserid || 'remote'}</div>
        </div>
      </div>
    </div>
  );
}

export default VideoSection;