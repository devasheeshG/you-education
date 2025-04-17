'use client';
import React from 'react';
import { motion } from 'framer-motion';

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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-zinc-700 bg-zinc-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm"
      >
        <p className="text-zinc-400">
          Video content will be displayed here when available.
        </p>
      </motion.div>
    );
  }

  if (!videoData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-zinc-700 bg-zinc-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm"
      >
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
        <p className="text-center text-zinc-400 mt-3">Loading video information...</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/50 backdrop-blur-sm shadow-lg"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-zinc-700 p-4">
        <h2 className="font-bold text-xl text-zinc-100">{videoData.title}</h2>
      </div>
      
      {/* Description */}
      <div className="p-5">
        <p className="leading-relaxed text-zinc-300">{videoData.description}</p>
      </div>

      {/* Chapters */}
      {videoData.chapters && videoData.chapters.length > 0 && (
        <div className="border-t border-zinc-700 p-5">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-zinc-100">
            <div className="bg-indigo-900/30 p-1.5 rounded-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            Chapters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {videoData.chapters.map((chapter, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(82, 82, 91, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer group border border-transparent hover:border-zinc-700"
              >
                <div className="bg-zinc-800 text-zinc-300 rounded px-2 py-1 text-sm font-mono group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-colors">
                  {chapter.time}
                </div>
                <span className="text-zinc-400 group-hover:text-zinc-100 transition-colors">{chapter.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoDescription;