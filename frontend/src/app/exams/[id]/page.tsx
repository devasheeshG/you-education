'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import YouTubePlayer from '@/components/youtube_player';
import MindmapPage from '@/components/mindmap';
import Chat from '@/components/chat';
import References from '@/components/resources';
import TabsContainer from '@/components/tabs_container';
import VideoDescription from '@/components/video_description';

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
      <div className="min-h-screen bg-background text-foreground flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-zinc-300 mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">Loading exam content...</p>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-2xl mx-auto p-8 border border-border rounded-md">
          <h1 className="text-2xl font-medium mb-4">Exam not found</h1>
          <p className="text-muted-foreground mb-6">The exam you're looking for doesn't exist or has been removed.</p>
          <a href="/exams" className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow hover:bg-foreground/90">
            Return to Exams
          </a>
        </div>
      </div>
    );
  }

  const hasYouTubeVideo = !!examData.youtubeUrl;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-medium">{examData.title}</h1>
              <p className="text-sm text-muted-foreground">Computer Science • Network Fundamentals</p>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-col lg:flex-row w-full gap-6">
          {/* Left content - video player and description */}
          <div className="w-full lg:w-3/5">
            {/* Video Player */}
            <div className="border border-border rounded-md p-4 mb-4 bg-card h-[400px]">
              {hasYouTubeVideo ? (
                <YouTubePlayer url={examData.youtubeUrl || ''} />
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-muted-foreground">No video available for this exam</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Description */}
            <VideoDescription 
              isYouTubeVideo={hasYouTubeVideo} 
              videoData={examData.videoData}
            />
          </div>

          {/* Right content - fixed width tabs panel */}
          <div className="w-full lg:w-2/5">
            <div className="border border-border rounded-md bg-card h-full min-h-[600px]">
              <TabsContainer defaultActive="Mindmap">
                {{
                  Mindmap: <div className="h-full"><MindmapPage /></div>,
                  Chat: <div className="h-full"><Chat /></div>,
                  References: <div className="h-full"><References /></div>
                }}
              </TabsContainer>
            </div>
          </div>
        </div>

        {/* Footer area with controls */}
        <footer className="mt-8 flex justify-center">
          <button className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow hover:bg-foreground/90 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Continue with Next Topic
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExamPage;