'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import YouTubePlayer from '@/components/youtube_player';
import MindmapPage from '@/components/mindmap';
import Chat from '@/components/chat';
import References from '@/components/resources';
import TabsContainer from '@/components/tabs_container';
import VideoDescription from '@/components/video_description';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamData {
  id: string;
  title: string;
  description: string;
  youtubeUrl?: string;
  videoData?: {
    title: string;
    description: string;
    chapters: { time: string; title: string }[];
  };
}

const ExamPage = () => {
  const params = useParams();
  const examId = params.id as string;
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      try {
        const dummyData: ExamData = {
          id: examId,
          title: 'Computer Networking Concepts Explained',
          description: 'Learn the fundamental concepts of computer networking in this comprehensive lecture.',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoData: {
            title: 'Computer Networking Concepts Explained',
            description: 'This comprehensive lecture covers all major networking concepts including protocols, routing, and network architecture. Perfect for beginners and intermediate learners looking to understand how the internet works, data transmission principles, and network security fundamentals.',
            chapters: [
              { time: '0:00', title: 'Introduction' },
              { time: '5:30', title: 'Networking Fundamentals' },
              { time: '12:45', title: 'TCP/IP Protocol' },
              { time: '25:30', title: 'OSI Model Explained' },
              { time: '35:15', title: 'Routing and Switching' },
              { time: '45:20', title: 'Network Security Basics' },
              { time: '55:40', title: 'Future of Networking' }
            ]
          }
        };

        await new Promise(resolve => setTimeout(resolve, 500));
        
        setExamData(dummyData);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 flex justify-center items-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-zinc-400">Loading exam content...</p>
        </motion.div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">
        <motion.div 
          className="max-w-2xl mx-auto p-8 border border-zinc-700 rounded-xl bg-zinc-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-medium mb-4">Exam not found</h1>
          <p className="text-zinc-400 mb-6">The exam you're looking for doesn't exist or has been removed.</p>
          <a href="/exams" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-700 transition-all duration-300 hover:scale-105">
            Return to Exams
          </a>
        </motion.div>
      </div>
    );
  }

  const hasYouTubeVideo = !!examData.youtubeUrl;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-indigo-900/30 p-2 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-2xl font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{examData.title}</h1>
              <p className="text-sm text-zinc-400">Computer Science • Network Fundamentals</p>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <div className="flex flex-col lg:flex-row w-full gap-6">
          {/* Left content - video player and description */}
          <motion.div 
            className="w-full lg:w-3/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Video Player */}
            <motion.div 
              className="border border-zinc-700 rounded-xl p-4 mb-4 bg-zinc-800/50 shadow-lg backdrop-blur-sm h-[400px]"
              whileHover={{ borderColor: "rgb(129, 140, 248)" }}
              transition={{ duration: 0.3 }}
            >
              {hasYouTubeVideo ? (
                <YouTubePlayer url={examData.youtubeUrl || ''} />
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-zinc-400">No video available for this exam</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Video Description */}
            <motion.div
              className="border border-zinc-700 rounded-xl bg-zinc-800/50 shadow-lg backdrop-blur-sm p-4"
              whileHover={{ borderColor: "rgb(129, 140, 248)" }}
              transition={{ duration: 0.3 }}
            >
              <VideoDescriptionStyled 
                isYouTubeVideo={hasYouTubeVideo} 
                videoData={examData.videoData}
              />
            </motion.div>
          </motion.div>

          {/* Right content - fixed width tabs panel */}
          <motion.div 
            className="w-full lg:w-2/5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div 
              className="border border-zinc-700 rounded-xl bg-zinc-800/50 shadow-lg backdrop-blur-sm h-full min-h-[600px]"
              whileHover={{ borderColor: "rgb(165, 180, 252)" }}
              transition={{ duration: 0.3 }}
            >
              <TabsContainerStyled defaultActive="Mindmap">
                {{
                  Mindmap: <div className="h-full"><MindmapPage /></div>,
                  Chat: <div className="h-full"><Chat /></div>,
                  References: <div className="h-full"><References /></div>
                }}
              </TabsContainerStyled>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer area with controls */}
        <motion.footer 
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.button 
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Continue with Next Topic
          </motion.button>
        </motion.footer>
      </div>
    </div>
  );
};

// Styled components to match the theme
function VideoDescriptionStyled({ isYouTubeVideo, videoData }: { isYouTubeVideo: boolean, videoData?: any }) {
  const [expanded, setExpanded] = useState(false);

  if (!isYouTubeVideo || !videoData) {
    return (
      <div className="p-2">
        <p className="text-zinc-400 text-sm">No description available</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2 text-indigo-300">Video Description</h3>
        <p className="text-sm text-zinc-300 mb-2">
          {expanded ? videoData.description : `${videoData.description.substring(0, 150)}...`}
        </p>
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3 text-indigo-300">Chapters</h3>
        <div className="space-y-2">
          {videoData.chapters.map((chapter: any, index: number) => (
            <motion.div 
              key={index}
              whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
            >
              <div className="bg-indigo-900/20 text-indigo-400 rounded px-2 py-1 text-xs font-medium min-w-[45px] text-center">
                {chapter.time}
              </div>
              <span className="text-sm">{chapter.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabsContainerStyled({ defaultActive, children }: { defaultActive: string, children: Record<string, React.ReactNode> }) {
  const [activeTab, setActiveTab] = useState(defaultActive);
  const tabs = Object.keys(children);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-zinc-700">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab 
              ? 'text-indigo-300' 
              : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" 
              />
            )}
          </button>
        ))}
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ExamPage;