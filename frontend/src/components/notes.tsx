'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface NotesProps {
  markdownContent?: string;
  markdownUrl?: string;
  title?: string;
  className?: string;
}

const Notes: React.FC<NotesProps> = ({ 
  markdownContent, 
  markdownUrl, 
  title = 'Notes',
  className = '' 
}) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (markdownContent) {
        setContent(markdownContent);
        return;
      }

      if (markdownUrl) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch(markdownUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch markdown: ${response.status}`);
          }
          
          const text = await response.text();
          setContent(text);
        } catch (err: any) {
          console.error('Error loading markdown:', err);
          setError(`Failed to load content: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchContent();
  }, [markdownContent, markdownUrl]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isFullScreen ? 'fullscreen' : 'normal'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`
          ${className}
          ${isFullScreen 
            ? 'fixed inset-0 z-50 bg-zinc-900' 
            : 'border border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/50 backdrop-blur-sm shadow-lg h-full'
          }
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-zinc-700 p-3 flex items-center justify-between">
          <h2 className="font-bold text-zinc-100">{title}</h2>
          <button 
            onClick={toggleFullScreen}
            className="p-1.5 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
            aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
          >
            {isFullScreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"></path>
                <path d="M9 21H3v-6"></path>
                <path d="M21 3l-7 7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 bg-red-900/20 border border-red-700/30 rounded-md p-4">
              <p>{error}</p>
            </div>
          ) : content ? (
            <div className="prose prose-invert prose-indigo max-w-full">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-zinc-400 bg-zinc-800/50 rounded-md p-4 border border-zinc-700">
              <p>No content available. Please provide markdown content or a valid URL.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Notes;