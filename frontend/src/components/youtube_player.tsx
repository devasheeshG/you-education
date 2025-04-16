'use client';
import React from "react";
import ReactPlayer from "react-player/youtube";

const YouTubePlayer = ({ url }: { url: string }) => {
  return (
    <div className="relative w-full h-full pt-[56.25%] border border-border rounded-md overflow-hidden"> {/* 16:9 aspect ratio wrapper with border */}
      <div className="absolute top-0 left-0 w-full h-full bg-black">
        <ReactPlayer 
          url={url} 
          width="100%" 
          height="100%" 
          controls
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            playerVars: {
              modestbranding: 1,
              rel: 0
            }
          }}
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;
