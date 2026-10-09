import React, { useEffect, useRef } from 'react';
import "../styles/preloader.css";

const VideoPreloader = ({ onLoadingComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Smooth fade out before completing
      if (containerRef.current) {
        containerRef.current.style.opacity = '0';
      }
      setTimeout(() => {
        if (onLoadingComplete) onLoadingComplete();
      }, 2000); // fade out duration (1 sec)
    }, 6000); // now 4 seconds

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000"
    >
      <video
        src="0718.mp4" // your 4-sec video
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoPreloader;
