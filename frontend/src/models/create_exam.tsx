'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllSubjects, Subject, createSubject } from '@/app/api/subjects';

interface ExamCreationProps {
  onClose: () => void;
  onCreate?: (examData: ExamData) => void;
}

export interface ExamData {
  name: string;
  subject_id: string;
  description: string;
  exam_datetime: string;
  total_hours_to_dedicate: number;
}

export default function ExamCreationModal({ onClose, onCreate }: ExamCreationProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [examData, setExamData] = useState<ExamData>({
    name: '',
    subject_id: '',
    description: '',
    exam_datetime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    total_hours_to_dedicate: 1
  });
  
  // State for new subject creation
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState("6366F1"); // Default indigo color
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
      
      // Set the first subject as default if available
      if (response.subjects.length > 0) {
        setExamData(prev => ({ ...prev, subject_id: response.subjects[0].id }));
      }
      
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
      setSubjectError('Subject name is required');
      return;
    }

    try {
      setIsCreatingSubject(true);
      setSubjectError(null);
      
      const response = await createSubject({
        name: newSubjectName,
        color: newSubjectColor
      });
      
      // Add the new subject to our list and select it
      setSubjects(prev => [...prev, response]);
      setExamData(prev => ({ ...prev, subject_id: response.id }));
      
      // Close the subject modal
      setShowSubjectModal(false);
      setNewSubjectName("");
      
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
      // If "Add new subject" is selected, open the subject modal
      setShowSubjectModal(true);
      
      // Reset subject selection to previous value
      if (subjects.length > 0 && !examData.subject_id) {
        setExamData(prev => ({ ...prev, subject_id: subjects[0].id }));
      }
    } else {
      setExamData(prev => ({ ...prev, subject_id: value }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'total_hours_to_dedicate') {
      // Ensure it's a number between 1 and 50
      const hours = Math.max(1, Math.min(50, parseInt(value) || 1));
      setExamData(prev => ({ ...prev, [name]: hours }));
    } else {
      setExamData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Basic validation
    if (!examData.name.trim()) {
      setError('Please enter an exam name');
      return;
    }
    if (!examData.subject_id) {
      setError('Please select a subject');
      return;
    }
    if (!examData.exam_datetime) {
      setError('Please set an exam date and time');
      return;
    }
    
    // Format the date correctly for the API
    const formattedData = {
      ...examData,
      exam_datetime: new Date(examData.exam_datetime).toISOString()
    };
    
    if (onCreate) {
      onCreate(formattedData);
    }
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

  // Helper function to create color preview
  const getColorPreview = (color: string) => {
    return {
      backgroundColor: `#${color}`,
    };
  };

  // Cancel adding a new subject
  const closeSubjectModal = () => {
    setShowSubjectModal(false);
    setNewSubjectName("");
    setSubjectError(null);
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
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            {/* Exam Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                Exam Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={examData.name}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter exam name"
                required
                maxLength={100}
              />
            </div>
            
            {/* Subject Dropdown */}
            <div>
              <label htmlFor="subject_id" className="block text-sm font-medium text-zinc-300 mb-1">
                Select Subject
              </label>
              <div className="relative">
                <select
                  id="subject_id"
                  name="subject_id"
                  value={examData.subject_id}
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
            </div>
            
            {/* Description field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={examData.description}
                onChange={handleChange}
                className="flex w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter exam description"
                rows={3}
              />
            </div>
            
            {/* Exam Date & Time Field */}
            <div>
              <label htmlFor="exam_datetime" className="block text-sm font-medium text-zinc-300 mb-1">
                Exam Date & Time
              </label>
              <input
                id="exam_datetime"
                name="exam_datetime"
                type="datetime-local"
                value={examData.exam_datetime}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            
            {/* Total Hours To Dedicate Field */}
            <div>
              <label htmlFor="total_hours_to_dedicate" className="block text-sm font-medium text-zinc-300 mb-1">
                Total Hours to Dedicate (1-50)
              </label>
              <div className="flex items-center">
                <input
                  id="total_hours_to_dedicate"
                  name="total_hours_to_dedicate"
                  type="number"
                  value={examData.total_hours_to_dedicate}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  min="1"
                  max="50"
                  required
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">Study hours you plan to dedicate for this exam</p>
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
              disabled={isLoading}
            >
              Create Exam
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Subject Creation Modal - Appears on top of Exam Creation Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={closeSubjectModal}>
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Add New Subject</h2>
                <button 
                  onClick={closeSubjectModal}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {subjectError && (
                <div className="bg-red-900/30 border border-red-800 text-red-300 px-3 py-2 rounded-md mb-4 text-xs">
                  {subjectError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="newSubjectName" className="block text-sm font-medium text-zinc-300 mb-1">
                    Subject Name
                  </label>
                  <input
                    id="newSubjectName"
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter subject name"
                    required
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <label htmlFor="newSubjectColor" className="block text-sm font-medium text-zinc-300 mb-1">
                    Subject Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-zinc-400">#</span>
                      </div>
                      <input
                        id="newSubjectColor"
                        type="text"
                        value={newSubjectColor}
                        onChange={(e) => setNewSubjectColor(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').substring(0, 6))}
                        className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-7 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Color hex code without #"
                        maxLength={6}
                      />
                    </div>
                    <div 
                      className="w-10 h-10 rounded-lg flex-shrink-0 border border-zinc-700"
                      style={getColorPreview(newSubjectColor)}
                    ></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generateRandomColor}
                  className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 border border-zinc-700 transition-colors flex-shrink-0 mt-2"
                >
                  Generate Random Color
                </button>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeSubjectModal}
                  className="py-2 px-4 rounded-lg bg-zinc-800 text-sm text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleCreateSubject}
                  disabled={isCreatingSubject}
                  className={`py-2 px-4 rounded-lg bg-indigo-600 text-sm text-white hover:bg-indigo-700 transition-colors ${isCreatingSubject ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCreatingSubject ? 'Creating...' : 'Create Subject'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}