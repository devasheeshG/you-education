'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UploadResourceModal from '../models/upload_resources';
import { motion } from 'framer-motion';
import { 
  getExamReferences, 
  uploadReferenceFile, 
  createReferenceFromUrl, 
  deleteReference,
  Reference as ApiReference
} from '../app/api/references';

// Resource type definition
type Resource = {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'ppt' | 'pptx' | 'doc' | 'docx' | 'youtube' | 'website';
  url?: string;
  dateAdded: string;
  size?: string;
  thumbnail?: string;
  description?: string;
};

// No need for props now as we'll get the examId from the URL
export default function Resources() {
  const params = useParams();
  // Extract the examId from the URL params
  const examId = params?.id as string || '';

  const [resources, setResources] = useState<Resource[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Fetch resources from the API
  const fetchResources = async () => {
    try {
      if (!examId) {
        setError("No exam ID found in URL");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setDebugInfo(`Fetching resources for exam ID: ${examId}...`);
      
      console.log("Fetching resources for exam:", examId);
      const data = await getExamReferences(examId);
      
      setDebugInfo("Resources fetched. Processing data...");
      
      // Process the response
      if (!data || !data.references) {
        setError("Invalid response format from API");
        setIsLoading(false);
        return;
      }
      
      // Convert API references to our Resource type
      const formattedResources = data.references.map(convertApiReferenceToResource);
      console.log("Formatted resources:", formattedResources);
      setDebugInfo(null);
      setResources(formattedResources);
    } catch (err: any) {
      console.error('Failed to fetch resources:', err);
      setError(`Failed to load resources: ${err.message || 'Unknown error'}`);
      setDebugInfo(`Error details: ${JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert API reference to our Resource type
  const convertApiReferenceToResource = (ref: ApiReference): Resource => {
    // Use type assertion to bypass the TypeScript error
    const reference = ref as (ApiReference & { url?: string });
    
    return {
      id: ref.id,
      name: ref.name,
      type: determineResourceType(ref.type),
      url: reference.url || '', // Access url with a fallback
      dateAdded: new Date().toISOString().split('T')[0], // API might not provide this
    };
  };

  // Helper function to map API resource types to our UI types
  const determineResourceType = (apiType: string): Resource['type'] => {
    switch (apiType) {
      case 'pdf': return 'pdf';
      case 'txt': return 'txt';
      case 'md': return 'md';
      case 'ppt': case 'pptx': return 'ppt';
      case 'doc': case 'docx': return 'docx';
      case 'yt_video_url': return 'youtube';
      case 'website_url': return 'website';
      default: return 'pdf'; // Default fallback
    }
  };

  // Fetch resources on component mount
  useEffect(() => {
    if (!examId) {
      console.error("No examId found in URL params");
      setError("No exam ID found in URL");
      setIsLoading(false);
      return;
    }
    
    console.log("Component mounted with examId from URL:", examId);
    fetchResources();
  }, [examId]);

  // Handle resource upload
  const handleResourceUpload = async (uploadData: any) => {
    if (!examId) {
      setError("No exam ID provided");
      return;
    }
    
    try {
      setDebugInfo("Processing upload...");
      const newResources: Resource[] = [];
      
      // Handle file uploads
      if (uploadData.files && uploadData.files.length > 0) {
        for (const file of uploadData.files) {
          try {
            setDebugInfo(`Uploading file: ${file.name}`);
            const uploadedReference = await uploadReferenceFile(examId, file);
            
            if (uploadedReference) {
              newResources.push(convertApiReferenceToResource(uploadedReference));
            }
          } catch (err: any) {
            console.error(`Failed to upload file ${file.name}:`, err);
            setDebugInfo(`Upload failed for ${file.name}: ${err.message}`);
          }
        }
      }
      
      // Handle YouTube link
      if (uploadData.youtubeLink) {
        try {
          setDebugInfo("Processing YouTube link...");
          const reference = await createReferenceFromUrl(examId, {
            type: 'yt_video_url',
            url: uploadData.youtubeLink
          });
          
          if (reference) {
            const resource = convertApiReferenceToResource(reference);
            resource.thumbnail = `https://img.youtube.com/vi/${getYoutubeVideoId(uploadData.youtubeLink)}/hqdefault.jpg`;
            resource.url = uploadData.youtubeLink; // Ensure URL is set
            newResources.push(resource);
          }
        } catch (err: any) {
          console.error('Failed to add YouTube link:', err);
          setDebugInfo(`Failed to add YouTube link: ${err.message}`);
        }
      }
      
      // Handle website link
      if (uploadData.websiteLink) {
        try {
          setDebugInfo("Processing website link...");
          const reference = await createReferenceFromUrl(examId, {
            type: 'website_url',
            url: uploadData.websiteLink
          });
          
          if (reference) {
            const resourceWithUrl = convertApiReferenceToResource(reference);
            resourceWithUrl.url = uploadData.websiteLink; // Ensure URL is set explicitly
            newResources.push(resourceWithUrl);
          }
        } catch (err: any) {
          console.error('Failed to add website link:', err);
          setDebugInfo(`Failed to add website link: ${err.message}`);
        }
      }
      
      // Update resources list with new ones at the top
      if (newResources.length > 0) {
        setResources(prev => [...newResources, ...prev]);
        setDebugInfo(null);
      } else {
        setDebugInfo("No resources were successfully uploaded");
      }
      
      setShowUploadModal(false);
    } catch (err: any) {
      console.error('Error in resource upload:', err);
      setDebugInfo(`Upload error: ${err.message}`);
    }
  };

  // Delete a resource
  const handleDeleteResource = async (id: string) => {
    if (!examId) {
      setError("No exam ID provided");
      return;
    }
    
    try {
      setDebugInfo(`Deleting resource ${id}...`);
      await deleteReference(examId, id);
      setResources(prev => prev.filter(resource => resource.id !== id));
      setDebugInfo(null);
    } catch (err: any) {
      console.error('Failed to delete resource:', err);
      setDebugInfo(`Delete failed: ${err.message}`);
    }
  };

  // Helper function to get YouTube video ID
  const getYoutubeVideoId = (url: string): string => {
    if (!url) return 'default';
    
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.substring(1);
      }
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        return urlObj.searchParams.get('v') || '';
      }
    } catch (_error) {
      // Invalid URL
    }
    return 'default';
  };

  // Function to get hostname from URL
  const getHostname = (url: string) => {
    if (!url) return 'unknown';
    
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (_error) {
      return 'unknown';
    }
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

  // Get resource action buttons based on type
  const getResourceActions = (resource: Resource) => {
    if (resource.type === 'youtube' && resource.url) {
      return (
        <motion.a 
          whileHover={{ scale: 1.05 }}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-red-700 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          Watch
        </motion.a>
      );
    }
    
    if (resource.type === 'website' && resource.url) {
      return (
        <motion.a 
          whileHover={{ scale: 1.05 }}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-purple-700 text-white px-2 py-1 rounded hover:bg-purple-600 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          Visit
        </motion.a>
      );
    }
    
    // For document types, return null to remove the Open/Download button
    return null;
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
          <div className="text-xs text-zinc-500">
            Exam ID: {examId ? `${examId.substring(0, 8)}...` : 'Not found in URL'}
          </div>
        </div>
        
        {/* Debug information */}
        {debugInfo && (
          <div className="mb-4 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded-md text-xs text-yellow-200">
            <div className="font-mono">{debugInfo}</div>
          </div>
        )}
        
        {/* Resource List - Now using full width */}
        <div className="w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
              <div className="text-sm text-zinc-400">Loading resources...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-zinc-400">{error}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchResources}
                className="mt-4 text-sm bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600 transition-all"
              >
                Try Again
              </motion.button>
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-6">
              {/* Group resources by type */}
              <div>
                <h3 className="text-xs uppercase text-zinc-500 mb-2 font-semibold">Documents</h3>
                {resources.filter(r => 
                  ['pdf', 'txt', 'md', 'ppt', 'pptx', 'doc', 'docx'].includes(r.type)
                ).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {resources.filter(r => 
                      ['pdf', 'txt', 'md', 'ppt', 'pptx', 'doc', 'docx'].includes(r.type)
                    ).map(resource => (
                      <motion.div 
                        key={resource.id} 
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className={`flex flex-col p-3 rounded-md border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <div>
                              <span className="text-sm truncate max-w-[180px] text-zinc-100 block">{resource.name}</span>
                              <span className="text-xs text-zinc-500">
                                {resource.type.toUpperCase()} • {resource.dateAdded}
                              </span>
                            </div>
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
                        </div>
                        <div className="mt-auto pt-2 flex justify-end">
                          {getResourceActions(resource)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-2 px-3 bg-zinc-800/50 rounded-md">No documents added yet</div>
                )}
              </div>

              {/* YouTube Videos */}
              <div>
                <h3 className="text-xs uppercase text-zinc-500 mb-2 font-semibold">YouTube Videos</h3>
                {resources.filter(r => r.type === 'youtube').length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {resources.filter(r => r.type === 'youtube').map(resource => (
                      <motion.div 
                        key={resource.id} 
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="border border-zinc-700 rounded-md overflow-hidden bg-zinc-800/50 hover:bg-zinc-800 group"
                      >
                        <div className="aspect-video bg-black relative overflow-hidden">
                          {resource.thumbnail ? (
                            <img 
                              src={resource.thumbnail} 
                              alt={resource.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <svg className="h-12 w-12 text-red-500 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40">
                            {getResourceActions(resource)}
                          </div>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <div>
                            <div className="text-sm text-zinc-100 truncate max-w-[200px]">{resource.name}</div>
                            <div className="text-xs text-red-400 flex items-center gap-1">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                              YouTube Video
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteResource(resource.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Delete reference"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-2 px-3 bg-zinc-800/50 rounded-md">No YouTube videos added yet</div>
                )}
              </div>

              {/* Websites */}
              <div>
                <h3 className="text-xs uppercase text-zinc-500 mb-2 font-semibold">Websites</h3>
                {resources.filter(r => r.type === 'website').length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {resources.filter(r => r.type === 'website').map(resource => (
                      <motion.div 
                        key={resource.id} 
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="border border-zinc-700 rounded-md overflow-hidden bg-zinc-800/50 hover:bg-zinc-800 group"
                      >
                        <div className="relative">
                          <div className="bg-zinc-900 p-2 flex items-center space-x-2 border-b border-zinc-700">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex-1 text-center">
                              <div className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-400 text-xs truncate max-w-xs mx-auto">
                                {resource.url || 'Website URL'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <div>
                            <div className="text-sm text-zinc-100 truncate max-w-[200px]">{resource.name}</div>
                            <div className="text-xs text-purple-400 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                              </svg>
                              {resource.url ? getHostname(resource.url) : 'Website'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getResourceActions(resource)}
                            <button 
                              onClick={() => handleDeleteResource(resource.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 transition-colors"
                              title="Delete reference"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-2 px-3 bg-zinc-800/50 rounded-md">No websites added yet</div>
                )}
              </div>
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