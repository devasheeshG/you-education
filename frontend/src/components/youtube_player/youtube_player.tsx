'use client';
import React from "react";
import ReactPlayer from "react-player/youtube";

const YouTubePlayer = ({ url }: { url: string }) => {
  return (
    <div className="w-full aspect-video">
      <ReactPlayer url={url} width="50%" height="50%" controls />
    </div>
  );
};

export default YouTubePlayer;
