'use client';

import { useState, useEffect } from 'react';
import UploadResourceModal from '../models/upload_resources';
import { v4 as uuidv4 } from 'uuid';
import TabsContainer from './tabs_container';
import { motion } from 'framer-motion';

// Resource type definition
type Resource = {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'ppt' | 'pptx' | 'doc' | 'docx' | 'youtube' | 'website';
  url: string;
  dateAdded: string;
  size?: string; // For files
  thumbnail?: string; // For videos/images
  description?: string;
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Fetch initial resources (mock data for now)
  useEffect(() => {
    // Simulating API call to fetch resources
    setTimeout(() => {
      setResources([
        {
          id: '1',
          name: 'Physics Notes.pdf',
          type: 'pdf',
          url: '/resources/physics-notes.pdf',
          dateAdded: '2025-04-10',
          size: '2.4 MB',
          description: 'Comprehensive notes on quantum mechanics and relativity'
        },
        {
          id: '2',
          name: 'Mathematics Formulas.docx',
          type: 'docx',
          url: '/resources/math-formulas.docx',
          dateAdded: '2025-04-08',
          size: '1.1 MB',
          description: 'Collection of important formulas for calculus and algebra'
        },
        {
          id: '3',
          name: 'Introduction to Chemistry',
          type: 'txt',
          url: '/resources/intro-chemistry.txt',
          dateAdded: '2025-04-12',
          size: '450 KB',
          description: 'Basic chemistry concepts and principles'
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  // Handle resource upload
  const handleResourceUpload = (uploadedResources: any) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newResources: Resource[] = [];

    // Process uploaded files
    if (uploadedResources.files && uploadedResources.files.length > 0) {
      uploadedResources.files.forEach((file: File) => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        let type = 'pdf';
        
        // Determine file type
        if (extension === 'txt') type = 'txt' as const;
        else if (extension === 'md') type = 'md' as const;
        else if (['ppt', 'pptx'].includes(extension || '')) type = 'ppt' as const;
        else if (['doc', 'docx'].includes(extension || '')) type = 'doc' as const;
        
        newResources.push({
          id: uuidv4(),
          name: file.name,
          type: type as any,
          url: URL.createObjectURL(file),
          dateAdded: currentDate,
          size: formatFileSize(file.size)
        });
      });
    }

    // Process YouTube link
    if (uploadedResources.youtubeLink) {
      const videoId = getYoutubeVideoId(uploadedResources.youtubeLink);
      newResources.push({
        id: uuidv4(),
        name: `YouTube Video (${videoId})`,
        type: 'youtube',
        url: uploadedResources.youtubeLink,
        dateAdded: currentDate,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      });
    }

    // Process website link
    if (uploadedResources.websiteLink) {
      const hostname = new URL(uploadedResources.websiteLink).hostname;
      newResources.push({
        id: uuidv4(),
        name: hostname,
        type: 'website',
        url: uploadedResources.websiteLink,
        dateAdded: currentDate
      });
    }

    // Add new resources to the list
    setResources(prev => [...newResources, ...prev]);
    setShowUploadModal(false);
  };

  // Delete a resource
  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(resource => resource.id !== id));
    if (selectedResource?.id === id) {
      setSelectedResource(null);
    }
  };

  // Helper function to get YouTube video ID
  const getYoutubeVideoId = (url: string): string => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.substring(1);
      }
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        return urlObj.searchParams.get('v') || '';
      }
    } catch (e) {
      // Invalid URL
    }
    return 'default';
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get appropriate icon for resource type
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
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
      case 'youtube':
        return (
          <div className="bg-red-900/30 p-1.5 rounded-md">
            <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'website':
        return (
          <div className="bg-purple-900/30 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
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

  // Resource list for the References tab
  const ReferencesContent = () => {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-2 rounded-md text-sm transition-colors border border-zinc-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Resource
          </motion.button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-1">
              {resources.map(resource => (
                <motion.div 
                  key={resource.id} 
                  whileHover={{ scale: 1.01, borderColor: "rgb(165, 180, 252)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`flex items-center justify-between p-3 rounded-md border ${selectedResource?.id === resource.id ? 'border-indigo-500 bg-zinc-800' : 'border-zinc-700 bg-zinc-800/50'} cursor-pointer group`}
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="flex items-center gap-3">
                    {getResourceIcon(resource.type)}
                    <span className="text-sm truncate max-w-[180px] text-zinc-100">{resource.name}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteResource(resource.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Delete reference"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm text-zinc-400">No references yet</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-900/30"
              >
                Add your first reference
              </motion.button>
            </div>
          )}
        </div>
        
        {selectedResource && (
          <div className="mt-4 border-t border-zinc-700 pt-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-zinc-100">{selectedResource.name}</h3>
              <span className="text-xs text-zinc-400">{selectedResource.dateAdded}</span>
            </div>
            {selectedResource.description && (
              <p className="mt-2 text-sm text-zinc-400">{selectedResource.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href={selectedResource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-md hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-900/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                View Resource
              </motion.a>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      <ReferencesContent />
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadResourceModal 
          onClose={() => setShowUploadModal(false)} 
          onUpload={handleResourceUpload}
        />
      )}
    </div>
  );
}