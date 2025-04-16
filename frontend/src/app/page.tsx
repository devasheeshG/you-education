'use client';

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <LandingPage />
    </div>
  );
}

function LandingPage() {
  const [showExamCreation, setShowExamCreation] = useState(false);
  const [currentDate] = useState("April 17, 2025");
  
  // Mock data for example exams
  const upcomingExams = [
    { id: 1, title: "Mathematics Final", date: "April 20, 2025", subject: "Mathematics", progress: 65 },
    { id: 2, title: "Physics Midterm", date: "April 25, 2025", subject: "Physics", progress: 40 },
    { id: 3, title: "Chemistry Lab", date: "May 5, 2025", subject: "Chemistry", progress: 30 },
  ];
  
  const pastExams = [
    { id: 4, title: "History Quiz", date: "April 10, 2025", score: "85%", subject: "History" },
    { id: 5, title: "English Literature Essay", date: "April 5, 2025", score: "92%", subject: "English" },
  ];

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
              <p className="text-2xl font-medium text-emerald-400">88%</p>
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
                <p className="text-lg font-medium text-indigo-300">{upcomingExams[0]?.date}</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Upcoming exams section */}
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
            {upcomingExams.map((exam, index) => (
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
                      {exam.subject}
                    </div>
                    <h3 className="font-medium text-lg">{exam.title}</h3>
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
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: `${exam.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-zinc-400">{exam.progress}%</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{exam.date}</span>
                  </div>
                  <button className="inline-flex items-center justify-center rounded-md bg-indigo-600/30 border border-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-300 shadow-sm hover:bg-indigo-600/50 transition-colors">Study Now</button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Past exams section */}
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
                      {exam.subject}
                    </div>
                    <h3 className="font-medium text-lg">{exam.title}</h3>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-300">
                    {exam.score}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{exam.date}</span>
                  </div>
                  <button className="inline-flex items-center justify-center rounded-md bg-purple-600/30 border border-purple-500/30 px-3 py-1 text-xs font-medium text-purple-300 shadow-sm hover:bg-purple-600/50 transition-colors">Review</button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="mt-16 mb-8 text-center text-zinc-500 text-xs">
        <p>© {new Date().getFullYear()} YouEducation. All rights reserved.</p>
      </footer>

      <AnimatePresence>
        {showExamCreation && <ExamCreationModal onClose={() => setShowExamCreation(false)} />}
      </AnimatePresence>
    </div>
  );
}

interface ExamCreationProps {
  onClose: () => void;
}

function ExamCreationModal({ onClose }: ExamCreationProps) {
  const subjects = [
    "Mathematics", 
    "Physics", 
    "Chemistry", 
    "Biology", 
    "History", 
    "English", 
    "Computer Science"
  ];
  
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would handle the creation of a new exam
    console.log("Creating exam:", { subject: selectedSubject, title: examTitle, date: examDate });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Create New Exam</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="examTitle" className="text-sm font-medium text-zinc-300">
                Exam Title
              </label>
              <input
                id="examTitle"
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter exam title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-zinc-300">
                Select Subject
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              >
                <option value="" disabled>Choose a subject...</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="examDate" className="text-sm font-medium text-zinc-300">
                Exam Date
              </label>
              <input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 shadow-sm hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Create Exam
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}