'use client';
import React from 'react';

interface VideoDescriptionProps {
  videoData?: {
    title: string;
    description: string;
    chapters?: { time: string; title: string }[];
  };
  isYouTubeVideo: boolean;
}

const VideoDescription: React.FC<VideoDescriptionProps> = ({ videoData, isYouTubeVideo }) => {
  if (!isYouTubeVideo) {
    return (
      <div className="card p-6 rounded-md">
        <p className="text-muted-foreground">
          Video content will be displayed here when available.
        </p>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="card p-6 rounded-md">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-center text-muted-foreground mt-3">Loading video information...</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Header */}
      <div className="bg-secondary p-4">
        <h2 className="font-bold text-xl">{videoData.title}</h2>
      </div>
      
      {/* Description */}
      <div className="p-5">
        <p className="leading-relaxed">{videoData.description}</p>
      </div>

      {/* Chapters */}
      {videoData.chapters && videoData.chapters.length > 0 && (
        <div className="border-t border-border p-5">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Chapters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {videoData.chapters.map((chapter, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer group"
              >
                <div className="bg-secondary text-secondary-foreground rounded px-2 py-1 text-sm font-mono group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {chapter.time}
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{chapter.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDescription;