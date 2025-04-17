'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllSubjects, createSubject, Subject } from '@/app/api/subjects';

interface ExamCreationProps {
  onClose: () => void;
  onCreate?: (examData: ExamData) => void;
}

export interface ExamData {
  title: string;
  subject: string;
  date: string;
}

export default function ExamCreationModal({ onClose, onCreate }: ExamCreationProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  
  // State for new subject creation
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState("ffffff"); // Default white color
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Fetch subjects when component mounts
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await getAllSubjects();
      setSubjects(response.subjects);
      setError(null);
    } catch (err) {
      setError('Failed to load subjects. Please try again.');
      console.error('Error fetching subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      setSubjectError("Subject name is required");
      return;
    }

    try {
      setSubjectError(null);
      setIsCreatingSubject(true);
      
      const newSubject = await createSubject({
        name: newSubjectName.trim(),
        color: newSubjectColor
      });
      
      // Add the new subject to the list and select it
      setSubjects(prev => [...prev, newSubject]);
      setSelectedSubject(newSubject.id);
      
      // Reset subject creation form
      setIsAddingSubject(false);
      setNewSubjectName("");
      setNewSubjectColor("ffffff");
    } catch (err) {
      console.error('Error creating subject:', err);
      setSubjectError('Failed to create subject. Please try again.');
    } finally {
      setIsCreatingSubject(false);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "add_new") {
      // If "Add new subject" is selected, switch to subject creation mode
      setIsAddingSubject(true);
    } else {
      setSelectedSubject(value);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Prepare the exam data
    const examData: ExamData = {
      title: examTitle,
      subject: selectedSubject,
      date: examDate
    };
    
    // Call the onCreate callback if provided
    if (onCreate) {
      onCreate(examData);
    }
    
    onClose();
  };

  // Generate a random color for the new subject
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    setNewSubjectColor(color);
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
          <div className="space-y-6">
            {/* Exam Title Field */}
            <div>
              <label htmlFor="examTitle" className="block text-sm font-medium text-zinc-300 mb-1">
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
            
            {/* Subject Dropdown or Add Subject Form */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-zinc-300 mb-1">
                Select Subject
              </label>
              
              {!isAddingSubject ? (
                // Subject Selection UI
                <>
                  <div className="relative">
                    <select
                      id="subject"
                      value={selectedSubject}
                      onChange={handleSubjectChange}
                      className="appearance-none h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-8"
                      required
                      disabled={isLoading}
                    >
                      <option value="" disabled>
                        {isLoading ? 'Loading subjects...' : 'Choose a subject...'}
                      </option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                      <option value="add_new">+ Add new subject</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </>
              ) : (
                // Add New Subject Form
                <div className="space-y-3 border border-zinc-700 rounded-lg p-3 bg-zinc-800/30">
                  <div>
                    <label htmlFor="subjectName" className="block text-xs font-medium text-zinc-400 mb-1">
                      Subject Name
                    </label>
                    <input
                      id="subjectName"
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="Enter new subject name"
                      className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subjectColor" className="block text-xs font-medium text-zinc-400 mb-1">
                      Subject Color
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-grow flex items-center relative">
                        <span className="absolute left-3 text-zinc-400">#</span>
                        <input
                          id="subjectColor"
                          type="text"
                          value={newSubjectColor}
                          onChange={(e) => setNewSubjectColor(e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6))}
                          className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Color hex (e.g. FF5733)"
                          maxLength={6}
                        />
                      </div>
                      <div 
                        className="h-9 w-9 rounded-md border border-zinc-700 cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: `#${newSubjectColor || 'ffffff'}` }}
                        onClick={generateRandomColor}
                        title="Generate random color"
                      >
                        <svg className="h-4 w-4 text-zinc-900/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {subjectError && (
                    <p className="text-red-500 text-xs">{subjectError}</p>
                  )}
                  
                  <div className="flex justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingSubject(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateSubject}
                      disabled={isCreatingSubject}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md transition-colors"
                    >
                      {isCreatingSubject ? 'Creating...' : 'Create Subject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Exam Date Field */}
            <div>
              <label htmlFor="examDate" className="block text-sm font-medium text-zinc-300 mb-1">
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
          
          <div className="flex justify-end space-x-3 mt-8">
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
              disabled={isLoading || isAddingSubject}
            >
              Create Exam
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}