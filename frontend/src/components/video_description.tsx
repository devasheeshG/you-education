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
      <div className="glassmorphism p-6 rounded-lg">
        <p className="text-gray-400">
          Video content will be displayed here when available.
        </p>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="glassmorphism p-6 rounded-lg">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center text-gray-400 mt-3">Loading video information...</p>
      </div>
    );
  }

  return (
    <div className="glassmorphism border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-4">
        <h2 className="font-bold text-xl text-white glow-text">{videoData.title}</h2>
      </div>
      
      {/* Description */}
      <div className="p-5 text-gray-300">
        <p className="leading-relaxed">{videoData.description}</p>
      </div>

      {/* Chapters */}
      {videoData.chapters && videoData.chapters.length > 0 && (
        <div className="border-t border-gray-800 p-5">
          <h3 className="font-semibold text-lg mb-3 text-white flex items-center gap-2">
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
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition-colors cursor-pointer group"
              >
                <div className="bg-blue-900 text-blue-200 rounded px-2 py-1 text-sm font-mono group-hover:bg-blue-700 transition-colors">
                  {chapter.time}
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">{chapter.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDescription;