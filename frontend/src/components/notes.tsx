'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { createPortal } from 'react-dom';

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
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side rendering for portals
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    console.log("Toggling fullscreen, current state:", isFullScreen);
    setIsFullScreen(!isFullScreen);
  };

  // Helper function to render content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    } else if (error) {
      return (
        <div className="text-red-400 bg-red-900/20 border border-red-700/30 rounded-md p-4">
          <p>{error}</p>
        </div>
      );
    } else if (content) {
      return (
        <div className="prose prose-invert prose-indigo max-w-full">
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    } else {
      return (
        <div className="text-zinc-400 bg-zinc-800/50 rounded-md p-4 border border-zinc-700">
          <p>No content available. Please provide markdown content or a valid URL.</p>
        </div>
      );
    }
  };

  return (
    <>
      {/* Regular view */}
      <div className={`
        ${className}
        border border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/50 backdrop-blur-sm shadow-lg h-full
        flex flex-col
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-zinc-700 p-3 flex items-center justify-between">
          <h2 className="font-bold text-zinc-100">{title}</h2>
          <button 
            onClick={toggleFullScreen}
            className="p-1.5 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
            aria-label="Enter full screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"></path>
              <path d="M9 21H3v-6"></path>
              <path d="M21 3l-7 7"></path>
              <path d="M3 21l7-7"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {renderContent()}
        </div>
      </div>
      
      {/* Fullscreen Modal */}
      {isMounted && isFullScreen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-6xl max-h-[95vh] shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-zinc-700 p-4 flex items-center justify-between rounded-t-xl">
              <h2 className="font-bold text-zinc-100 text-xl">{title}</h2>
              <button 
                onClick={toggleFullScreen}
                className="p-2 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
                aria-label="Exit full screen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Notes;