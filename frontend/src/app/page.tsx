'use client';

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
      <header className="mb-10 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-muted p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-medium">YouEducation</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">Your personal exam preparation platform | {currentDate}</p>
      </header>

      <main className="space-y-12">
        {/* Dashboard overview card */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-medium mb-2">Dashboard Overview</h2>
              <p className="text-sm text-muted-foreground">Track your upcoming exams and past performance</p>
            </div>
            <button 
              onClick={() => setShowExamCreation(true)}
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow hover:bg-foreground/90 transition-colors"
              aria-label="Create new exam"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Exam
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="border border-border rounded-md p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Upcoming Exams</h3>
              <p className="text-2xl font-medium">{upcomingExams.length}</p>
            </div>
            <div className="border border-border rounded-md p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Completed Exams</h3>
              <p className="text-2xl font-medium">{pastExams.length}</p>
            </div>
            <div className="border border-border rounded-md p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Average Score</h3>
              <p className="text-2xl font-medium">88%</p>
            </div>
            <div className="border border-border rounded-md p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Next Exam</h3>
              <p className="text-lg font-medium">{upcomingExams[0]?.date}</p>
            </div>
          </div>
        </section>

        {/* Upcoming exams section */}
        <section>
          <h2 className="text-2xl font-medium mb-6">Upcoming Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingExams.map(exam => (
              <div key={exam.id} className="border border-border rounded-md p-5 hover:border-zinc-400 transition-colors bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium mb-2">{exam.subject}</span>
                    <h3 className="font-medium text-lg">{exam.title}</h3>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground" aria-label="More options">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{exam.date}</span>
                  </div>
                  <button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-muted transition-colors">Study Now</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past exams section */}
        <section>
          <h2 className="text-2xl font-medium mb-6">Past Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastExams.map(exam => (
              <div key={exam.id} className="border border-border rounded-md p-5 hover:border-zinc-400 transition-colors bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium mb-2">{exam.subject}</span>
                    <h3 className="font-medium text-lg">{exam.title}</h3>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-medium">
                    {exam.score}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{exam.date}</span>
                  </div>
                  <button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-muted transition-colors">Review</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 mb-8 text-center text-muted-foreground text-xs">
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-medium">Create New Exam</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
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
              <label htmlFor="examTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Exam Title
              </label>
              <input
                id="examTitle"
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                placeholder="Enter exam title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Subject
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                required
              >
                <option value="" disabled>Choose a subject...</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="examDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Exam Date
              </label>
              <input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow hover:bg-foreground/90 transition-colors"
            >
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
