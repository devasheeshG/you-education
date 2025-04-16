'use client';

import React, { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadResourceModalProps {
  onClose: () => void;
  onUpload?: (resources: any) => void;
}

export default function UploadResourceModal({ onClose, onUpload }: UploadResourceModalProps) {
  // States for different types of resources
  const [activeTab, setActiveTab] = useState<'files' | 'links'>('files');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types
  const allowedFileTypes = [
    'application/pdf', // PDF
    'text/plain', // TXT
    'text/markdown', // MD
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.ms-powerpoint', // PPT
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC
  ];

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => 
        allowedFileTypes.includes(file.type)
      );
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Open file browser
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove a file from the list
  const removeFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    // Prepare resources data
    const resources = {
      files: uploadedFiles,
      youtubeLink: youtubeLink.trim() ? youtubeLink : null,
      websiteLink: websiteLink.trim() ? websiteLink : null
    };

    // Here you would typically upload files to a server
    // For now, just simulate with a timeout
    setTimeout(() => {
      setIsUploading(false);
      if (onUpload) onUpload(resources);
      onClose();
    }, 1500);
  };

  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return (
          <div className="bg-red-900/30 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'txt':
      case 'md':
        return (
          <div className="bg-zinc-700/50 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-6H7v2h6V7zm0 4H7v2h6v-2zm-6 4h6v2H7v-2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'ppt':
      case 'pptx':
        return (
          <div className="bg-orange-900/30 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className="bg-blue-900/30 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-zinc-700/50 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-b border-zinc-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-100">Upload Learning Resources</h2>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
        
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-zinc-700">
            <motion.button
              whileHover={{ backgroundColor: "rgba(82, 82, 91, 0.3)" }}
              onClick={() => setActiveTab('files')}
              className={`py-2 px-4 flex items-center ${activeTab === 'files' 
                ? 'border-b-2 border-indigo-500 text-zinc-100 font-medium' 
                : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              <div className={`p-1.5 rounded-md ${activeTab === 'files' ? 'bg-indigo-900/30' : 'bg-zinc-800/50'} mr-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'files' ? 'text-indigo-400' : 'text-zinc-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              Files
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "rgba(82, 82, 91, 0.3)" }}
              onClick={() => setActiveTab('links')}
              className={`py-2 px-4 flex items-center ${activeTab === 'links' 
                ? 'border-b-2 border-purple-500 text-zinc-100 font-medium' 
                : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              <div className={`p-1.5 rounded-md ${activeTab === 'links' ? 'bg-purple-900/30' : 'bg-zinc-800/50'} mr-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'links' ? 'text-purple-400' : 'text-zinc-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              Links
            </motion.button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Section */}
            <AnimatePresence mode="wait">
              {activeTab === 'files' && (
                <motion.div 
                  key="files"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.01, borderColor: "#6366f1" }}
                    whileTap={{ scale: 0.99 }}
                    className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer transition-colors"
                    onClick={handleBrowseClick}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.txt,.md,.ppt,.pptx,.doc,.docx"
                    />
                    <div className="flex flex-col items-center">
                      <div className="bg-indigo-900/30 p-3 rounded-full mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-zinc-100">Drag & drop files or click to browse</p>
                      <p className="text-sm text-zinc-400 mt-1">Supported formats: PDF, TXT, Markdown, PPT, DOCX</p>
                    </div>
                  </motion.div>
                  
                  {/* File List */}
                  <AnimatePresence>
                    {uploadedFiles.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700"
                      >
                        <h3 className="text-sm font-medium mb-3 text-zinc-100">Uploaded Files</h3>
                        <ul className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <motion.li 
                              key={index} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              className="flex justify-between items-center bg-zinc-900 rounded-md p-2 border border-zinc-700"
                            >
                              <div className="flex items-center">
                                {getFileIcon(file.name)}
                                <span className="ml-2 text-sm truncate max-w-xs text-zinc-300">{file.name}</span>
                              </div>
                              <motion.button 
                                whileHover={{ scale: 1.1, color: "#f43f5e" }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-zinc-400 hover:text-red-400"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </motion.button>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              
              {/* Links Section */}
              {activeTab === 'links' && (
                <motion.div 
                  key="links"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="youtubeLink" className="block text-sm font-medium text-zinc-300 mb-1">
                      YouTube Link
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="bg-red-900/30 p-1 rounded-md">
                          <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                      </div>
                      <input
                        id="youtubeLink"
                        type="text"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                        className="w-full pl-11 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="websiteLink" className="block text-sm font-medium text-zinc-300 mb-1">
                      Website Link
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="bg-purple-900/30 p-1 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <input
                        id="websiteLink"
                        type="text"
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                        className="w-full pl-11 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-700 mt-6">
              <motion.button
                whileHover={{ backgroundColor: "rgba(82, 82, 91, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-700 hover:to-purple-700 transition-all ${
                  (activeTab === 'files' && uploadedFiles.length === 0 && !youtubeLink && !websiteLink)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={isUploading || (activeTab === 'files' && uploadedFiles.length === 0 && !youtubeLink && !websiteLink)}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : "Upload Resources"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}