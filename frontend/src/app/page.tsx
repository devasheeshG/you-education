'use client';

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 text-white p-4 md:p-6">
      <LandingPage />
    </div>
  );
}

function LandingPage() {
  const [showExamCreation, setShowExamCreation] = useState(false);
  const [currentDate] = useState("April 16, 2025");
  
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
    <div className="max-w-7xl mx-auto relative z-10">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>

      <header className="mb-12 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">YouEducation</h1>
        </div>
        <p className="text-gray-400 ml-12">Your personal exam preparation platform | {currentDate}</p>
      </header>

      <main className="relative">
        {/* Dashboard overview card */}
        <section className="glassmorphism p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 glow-text">Dashboard Overview</h2>
              <p className="text-gray-400">Track your upcoming exams and past performance</p>
            </div>
            <button 
              onClick={() => setShowExamCreation(true)}
              className="futuristic-button flex items-center gap-2"
              aria-label="Create new exam"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Exam
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glassmorphism p-5 border-l-4 border-blue-500">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-1">Upcoming Exams</h3>
              <p className="text-3xl font-bold">{upcomingExams.length}</p>
            </div>
            <div className="glassmorphism p-5 border-l-4 border-green-500">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-1">Completed Exams</h3>
              <p className="text-3xl font-bold">{pastExams.length}</p>
            </div>
            <div className="glassmorphism p-5 border-l-4 border-purple-500">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-1">Average Score</h3>
              <p className="text-3xl font-bold">88%</p>
            </div>
            <div className="glassmorphism p-5 border-l-4 border-yellow-500">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-1">Next Exam</h3>
              <p className="text-lg font-medium">{upcomingExams[0]?.date}</p>
            </div>
          </div>
        </section>

        {/* Upcoming exams section */}
        <section className="glassmorphism p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 glow-text">Upcoming Exams</h2>
          <div className="modular-grid">
            {upcomingExams.map(exam => (
              <div key={exam.id} className="futuristic-card p-6 glow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-600 bg-opacity-30 text-blue-400 rounded mb-2">{exam.subject}</span>
                    <h3 className="font-semibold text-lg">{exam.title}</h3>
                  </div>
                  <button className="text-gray-400 hover:text-white" aria-label="More options">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
                {/* <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{exam.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                      style={{ width: `${exam.progress}%` }}
                    />
                  </div>
                </div> */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{exam.date}</span>
                  </div>
                  <button className="futuristic-button text-sm py-1 px-3">Study Now</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past exams section */}
        <section className="glassmorphism p-8">
          <h2 className="text-2xl font-bold mb-6 glow-text">Past Exams</h2>
          <div className="modular-grid">
            {pastExams.map(exam => (
              <div key={exam.id} className="futuristic-card p-6 glow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs bg-green-600 bg-opacity-30 text-green-400 rounded mb-2">{exam.subject}</span>
                    <h3 className="font-semibold text-lg">{exam.title}</h3>
                  </div>
                  <div className="bg-green-600 bg-opacity-20 text-green-400 font-bold px-2 py-1 rounded text-sm">
                    {exam.score}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{exam.date}</span>
                  </div>
                  <button className="futuristic-button text-sm py-1 px-3">Review</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 mb-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} YouEducation. All rights reserved.</p>
      </footer>

      {showExamCreation && <ExamCreationModal onClose={() => setShowExamCreation(false)} />}
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="glassmorphism w-full max-w-lg p-6 animate-appear">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Create New Exam</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="examTitle" className="block text-sm font-medium mb-1 text-gray-300">
              Exam Title
            </label>
            <input
              id="examTitle"
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter exam title"
              required
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1 text-gray-300">
              Select Subject
            </label>
            <div className="relative">
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Choose a subject...</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="examDate" className="block text-sm font-medium mb-1 text-gray-300">
              Exam Date
            </label>
            <input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="futuristic-button"
            >
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
