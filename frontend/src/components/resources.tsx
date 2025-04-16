'use client';

import { useState, useEffect } from 'react';
import UploadResourceModal from '../models/upload_resources';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

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

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'files' | 'videos' | 'websites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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
          name: 'Introduction to Quantum Physics',
          type: 'youtube',
          url: 'https://www.youtube.com/watch?v=example',
          dateAdded: '2025-04-12',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          description: 'Video lecture explaining the fundamentals of quantum physics'
        },
        {
          id: '4',
          name: 'Chemistry Study Guide.pptx',
          type: 'pptx',
          url: '/resources/chemistry-guide.pptx',
          dateAdded: '2025-04-05',
          size: '5.7 MB',
          description: 'Presentation on organic chemistry concepts'
        },
        {
          id: '5',
          name: 'Khan Academy - Linear Algebra',
          type: 'website',
          url: 'https://www.khanacademy.org/math/linear-algebra',
          dateAdded: '2025-04-14',
          description: 'Complete course on linear algebra with examples'
        },
        {
          id: '6',
          name: 'History Timeline.txt',
          type: 'txt',
          url: '/resources/history-timeline.txt',
          dateAdded: '2025-04-03',
          size: '42 KB',
          description: 'Timeline of major historical events from 1900-2000'
        },
      ]);
      setIsLoading(false);
    }, 1000);
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
          url: URL.createObjectURL(file), // This is temporary, in a real app you'd upload to server
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

  // Filter and search resources
  const filteredResources = resources.filter(resource => {
    const matchesFilter = filter === 'all' || 
      (filter === 'files' && ['pdf', 'txt', 'md', 'ppt', 'pptx', 'doc', 'docx'].includes(resource.type)) ||
      (filter === 'videos' && resource.type === 'youtube') ||
      (filter === 'websites' && resource.type === 'website');
    
    const matchesSearch = searchQuery === '' || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Get appropriate icon for resource type
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="bg-red-500 bg-opacity-20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'txt':
      case 'md':
        return (
          <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-6H7v2h6V7zm0 4H7v2h6v-2zm-6 4h6v2H7v-2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'ppt':
      case 'pptx':
        return (
          <div className="bg-orange-500 bg-opacity-20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'youtube':
        return (
          <div className="bg-red-500 bg-opacity-20 p-3 rounded-full">
            <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'website':
        return (
          <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-500 bg-opacity-20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>

        <header className="mb-8 pt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Learning Resources</h1>
          </div>
          <p className="text-gray-400 ml-12">Access and manage your study materials and references</p>
        </header>

        <main className="relative">
          {/* Controls section */}
          <section className="glassmorphism p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('files')}
                  className={`px-3 py-1 rounded-md ${filter === 'files' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Files
                </button>
                <button
                  onClick={() => setFilter('videos')}
                  className={`px-3 py-1 rounded-md ${filter === 'videos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setFilter('websites')}
                  className={`px-3 py-1 rounded-md ${filter === 'websites' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Websites
                </button>
              </div>

              <button 
                onClick={() => setShowUploadModal(true)}
                className="futuristic-button flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Resources
              </button>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">
                {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <span>Sort by:</span>
                <select className="ml-2 bg-transparent border-b border-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer">
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>
          </section>

          {/* Resources grid */}
          <section className="glassmorphism p-6 mb-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <div key={resource.id} className="futuristic-card p-5 glow">
                    <div className="flex items-center gap-4 mb-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{resource.name}</h3>
                        <p className="text-xs text-gray-400">Added on {resource.dateAdded}</p>
                      </div>
                    </div>

                    {resource.type === 'youtube' && resource.thumbnail && (
                      <div className="relative mb-3 rounded-md overflow-hidden">
                        <img 
                          src={resource.thumbnail} 
                          alt="Video thumbnail" 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <div className="bg-red-600 rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {resource.description && (
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{resource.description}</p>
                    )}

                    <div className="flex justify-between items-center">
                      {resource.size && <span className="text-xs text-gray-400">{resource.size}</span>}
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-400">No resources found</h3>
                <p className="text-gray-500 mt-2">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Add your first resource to get started'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="futuristic-button mt-4"
                  >
                    Add Resources
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Quick tips section */}
          <section className="glassmorphism p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 glow-text">Resource Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-medium">Organize Resources</h3>
                </div>
                <p className="text-sm text-gray-300">Group related materials by subject or exam for easier access.</p>
              </div>
              <div className="bg-purple-900 bg-opacity-20 rounded-lg p-4 border border-purple-800">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <h3 className="font-medium">Share with Study Group</h3>
                </div>
                <p className="text-sm text-gray-300">Collaborate with classmates by sharing helpful materials.</p>
              </div>
              <div className="bg-green-900 bg-opacity-20 rounded-lg p-4 border border-green-800">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-medium">Review Regularly</h3>
                </div>
                <p className="text-sm text-gray-300">Set aside time each week to review your saved resources.</p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-16 mb-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} YouEducation. All rights reserved.</p>
        </footer>

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadResourceModal 
            onClose={() => setShowUploadModal(false)} 
            onUpload={handleResourceUpload}
          />
        )}
      </div>
    </div>
  );
}