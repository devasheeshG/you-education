'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExamCreationModal, { ExamData } from "../models/create_exam";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Exam {
  id: string;
  name: string;
  description: string;
  exam_datetime: string;
  total_hours_to_dedicate: number;
  subject: Subject;
}

interface ExamsResponse {
  upcomming_exams: Exam[];
  previous_exams: Exam[];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <LandingPage />
    </div>
  );
}

function LandingPage() {
  const [showExamCreation, setShowExamCreation] = useState(false);
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [pastExams, setPastExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy/exams');
        
        if (!response.ok) {
          throw new Error('Failed to fetch exams');
        }
        
        const data: ExamsResponse = await response.json();
        setUpcomingExams(data.upcomming_exams || []);
        setPastExams(data.previous_exams || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, []);

  const handleCreateExam = async (examData: ExamData) => {
    try {
      const response = await fetch('/api/proxy/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create exam');
      }
      
      const newExam = await response.json();
      
      // Refresh the exams list
      const examsResponse = await fetch('/api/proxy/exams');
      const data: ExamsResponse = await examsResponse.json();
      setUpcomingExams(data.upcomming_exams || []);
      setPastExams(data.previous_exams || []);
      
      setShowExamCreation(false);
    } catch (err) {
      console.error('Error creating exam:', err);
      // You could add error handling UI here
    }
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Calculate mock progress for upcoming exams
  const calculateMockProgress = (exam: Exam) => {
    const examDate = new Date(exam.exam_datetime);
    const now = new Date();
    const totalTime = exam.total_hours_to_dedicate;
    
    // Simple mock progress based on time remaining
    const timeLeft = (examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24); // days left
    const progress = Math.max(0, Math.min(100, 100 - (timeLeft * 5)));
    
    return Math.round(progress);
  };

  // Mock score for past exams (in a real app, this would come from the API)
  const getMockScore = (examId: string) => {
    // Generate a deterministic but random-looking score based on the exam ID
    const numericHash = examId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${70 + (numericHash % 30)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10 pt-8 flex justify-between items-center">
        <div>
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
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
            >
              YouEducation
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm text-zinc-400 ml-12"
          >
            Your personal exam preparation platform | {currentDate}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button 
            onClick={() => setShowExamCreation(true)}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-700 transition-all duration-300 hover:scale-105"
            aria-label="Create new exam"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Exam
          </button>
        </motion.div>
      </header>

      <main className="space-y-12">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Dashboard overview card */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-medium mb-2">Dashboard Overview</h2>
                  <p className="text-sm text-zinc-400">Track your upcoming exams and past performance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 backdrop-blur-sm shadow-lg"
                >
                  <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-1">Upcoming Exams</h3>
                  <p className="text-2xl font-medium text-indigo-300">{upcomingExams.length}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 backdrop-blur-sm shadow-lg"
                >
                  <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-1">Completed Exams</h3>
                  <p className="text-2xl font-medium text-indigo-300">{pastExams.length}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 backdrop-blur-sm shadow-lg"
                >
                  <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-1">Average Score</h3>
                  <p className="text-2xl font-medium text-emerald-400">
                    {pastExams.length > 0 ? '88%' : 'N/A'}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 backdrop-blur-sm shadow-lg"
                >
                  <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-1">Next Exam</h3>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-900/30 p-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-indigo-300">
                      {upcomingExams.length > 0 ? formatDate(upcomingExams[0].exam_datetime) : 'None'}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Upcoming exams section */}
            {upcomingExams.length > 0 ? (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
                  <span className="inline-block w-2 h-8 bg-indigo-500 rounded-full mr-2"></span>
                  Upcoming Exams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingExams.map((exam, index) => {
                    const progress = calculateMockProgress(exam);
                    return (
                      <motion.div 
                        key={exam.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        whileHover={{ scale: 1.03, borderColor: "rgb(165, 180, 252)" }}
                        className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="inline-flex items-center rounded-md bg-indigo-900/30 px-2 py-1 text-xs font-medium mb-2 text-indigo-300">
                              {exam.subject.name}
                            </div>
                            <h3 className="font-medium text-lg">{exam.name}</h3>
                          </div>
                          <button className="text-zinc-400 hover:text-zinc-200 transition-colors" aria-label="More options">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="mt-4 mb-4">
                          <p className="text-xs text-zinc-400 mb-1">Study progress</p>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className="text-xs text-right mt-1 text-zinc-400">{progress}%</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-zinc-400 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>{formatDate(exam.exam_datetime)}</span>
                          </div>
                          <button className="inline-flex items-center justify-center rounded-md bg-indigo-600/30 border border-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-300 shadow-sm hover:bg-indigo-600/50 transition-colors">Study Now</button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
                  <span className="inline-block w-2 h-8 bg-indigo-500 rounded-full mr-2"></span>
                  Upcoming Exams
                </h2>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 text-center">
                  <p className="text-zinc-400">No upcoming exams. Click "Create Exam" to add one.</p>
                </div>
              </motion.section>
            )}

            {/* Past exams section */}
            {pastExams.length > 0 ? (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
                  <span className="inline-block w-2 h-8 bg-purple-500 rounded-full mr-2"></span>
                  Past Exams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastExams.map((exam, index) => (
                    <motion.div 
                      key={exam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      whileHover={{ scale: 1.03, borderColor: "rgb(192, 132, 252)" }}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="inline-flex items-center rounded-md bg-purple-900/30 px-2 py-1 text-xs font-medium mb-2 text-purple-300">
                            {exam.subject.name}
                          </div>
                          <h3 className="font-medium text-lg">{exam.name}</h3>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-300">
                          {getMockScore(exam.id)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{formatDate(exam.exam_datetime)}</span>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-md bg-purple-600/30 border border-purple-500/30 px-3 py-1 text-xs font-medium text-purple-300 shadow-sm hover:bg-purple-600/50 transition-colors">Review</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
                  <span className="inline-block w-2 h-8 bg-purple-500 rounded-full mr-2"></span>
                  Past Exams
                </h2>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 text-center">
                  <p className="text-zinc-400">No past exams available.</p>
                </div>
              </motion.section>
            )}
          </>
        )}
      </main>

      <footer className="mt-16 mb-8 text-center text-zinc-500 text-xs">
        <p>© {new Date().getFullYear()} YouEducation. All rights reserved.</p>
      </footer>

      <AnimatePresence>
        {showExamCreation && <ExamCreationModal onClose={() => setShowExamCreation(false)} onCreate={handleCreateExam} />}
      </AnimatePresence>
    </div>
  );
}