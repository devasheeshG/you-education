"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { INode } from 'markmap-common';
import { motion } from 'framer-motion';

// Dummy API response types and data
type ApiResource = { id: string; data: { url?: string; /* other data */ } };
type ApiNode = {
  title: string;
  is_end_node: boolean;
  type?: string;
  resource?: ApiResource;
  subtopics?: ApiNode[];
};
const apiData: ApiNode = {
  title: 'STEM Exam Overview',
  is_end_node: false,
  subtopics: [
    {
      title: 'Mathematics',
      is_end_node: false,
      subtopics: [
        {
          title: 'Algebra',
          is_end_node: false,
          subtopics: [
            { title: 'Linear Algebra Concepts', is_end_node: true, type: 'youtube_video', resource: { id: 'm1', data: { url: 'https://www.youtube.com/watch?v=QxddU3sjVRY' } } },
            { title: 'Quadratic Equations Guide', is_end_node: true, type: 'Notes', resource: { id: 'm2', data: {} } }
          ]
        },
        {
          title: 'Calculus',
          is_end_node: false,
          subtopics: [
            { title: 'Limits Explained', is_end_node: true, type: 'youtube_video', resource: { id: 'm3', data: { url: 'https://www.youtube.com/watch?v=AX6OrbgS8lI' } } },
            { title: 'Derivatives Summary', is_end_node: true, type: 'Notes', resource: { id: 'm4', data: {} } },
            { title: 'Integrals Deep Dive', is_end_node: true, type: 'youtube_video', resource: { id: 'm5', data: { url: 'https://www.youtube.com/watch?v=5FQf_TrTmkM' } } }
          ]
        }
      ]
    },
    {
      title: 'Physics',
      is_end_node: false,
      subtopics: [
        {
          title: 'Mechanics',
          is_end_node: false,
          subtopics: [
            { title: 'Kinematics Basics', is_end_node: true, type: 'youtube_video', resource: { id: 'p1', data: { url: 'https://www.youtube.com/watch?v=K5KAc5CoCuk' } } },
            { title: 'Dynamics Notes', is_end_node: true, type: 'Notes', resource: { id: 'p2', data: {} } }
          ]
        },
        {
          title: 'Optics',
          is_end_node: false,
          subtopics: [
            { title: 'Reflection Principles', is_end_node: true, type: 'youtube_video', resource: { id: 'p3', data: { url: 'https://www.youtube.com/watch?v=4TIGwaBHuzg' } } },
            { title: 'Refraction Explained', is_end_node: true, type: 'youtube_video', resource: { id: 'p4', data: { url: 'hhttps://www.youtube.com/watch?v=4TIGwaBHuzg' } } },
            { title: 'Wave Optics Notes', is_end_node: true, type: 'Notes', resource: { id: 'p5', data: {} } }
          ]
        }
      ]
    }
  ]
};

// Map to store YouTube resources by title
const resourceMap = new Map<string, ApiResource>();

// Create a custom type that makes children optional
type MindMapNode = {
  content: string;
  children?: MindMapNode[];
  isLeaf?: boolean; // Add this to track leaf nodes
};

// Helper functions moved outside of the component
function childToMarkdown(node: MindMapNode, level: number): string {
  const heading = '#'.repeat(level);
  let markdown = `${heading} ${node.content}\n`;
  
  // Add a data attribute to identify leaf nodes in the Markdown
  if (node.isLeaf) {
    markdown = `${heading} ${node.content} <!-- isLeaf -->\n`;
  }
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      markdown += childToMarkdown(child, level + 1);
    });
  }
  
  return markdown;
}

// Convert API JSON to markdown and populate resourceMap
function apiToMarkdown(node: ApiNode, level = 1): string {
  // Track YouTube resources
  if (node.is_end_node && node.type === 'youtube_video' && node.resource) {
    resourceMap.set(node.title, node.resource);
  }
  let md = `${'#'.repeat(level)} ${node.title}\n`;
  if (node.subtopics) {
    node.subtopics.forEach(child => {
      md += apiToMarkdown(child, level + 1);
    });
  }
  return md;
}

export default function MindmapPage({ onLeafClick }: { onLeafClick: (url: string) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const transformer = new Transformer();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [is3DView, setIs3DView] = useState(false);

  const handleZoomIn = useCallback(() => {
    if (markmapRef.current) {
      markmapRef.current.rescale(zoomLevel + 0.2);
      setZoomLevel(prev => prev + 0.2);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (markmapRef.current) {
      markmapRef.current.rescale(Math.max(0.3, zoomLevel - 0.2));
      setZoomLevel(prev => Math.max(0.3, prev - 0.2));
    }
  }, [zoomLevel]);

  const handleReset = useCallback(() => {
    if (markmapRef.current) {
      markmapRef.current.fit();
      setZoomLevel(1);
    }
  }, []);

  const toggle3DView = useCallback(() => {
    setIs3DView(prev => !prev);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !svgRef.current) return;
    
    // Clean up any existing markmap
    if (markmapRef.current) {
      markmapRef.current.destroy();
    }
    
    // Prepare markdown from API data
    resourceMap.clear();
    const md = apiToMarkdown(apiData);
    const { root } = transformer.transform(md);
    
    // Create the markmap with theme matching the app
    const mm = Markmap.create(svgRef.current, {
      autoFit: true,
      initialExpandLevel: 2,
      color: (node: INode) => {
        // Use indigo/purple gradient colors
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#e879f9'];
        const depth = node.state?.depth || 0;
        return colors[Math.min(depth, colors.length - 1)];
      },
      paddingX: 16,
      duration: 500,
      style: undefined // Remove unsupported properties
    }, root);
    
    markmapRef.current = mm;
    
    // Add click event listener to the SVG element
    const handleNodeClick = (event: MouseEvent) => {
      const nodeG = (event.target as Element).closest('g.markmap-node') as SVGGElement;
      if (!nodeG) return;
      const nodeData = (nodeG as any).__data__ as INode;
      const isLeaf = !nodeData.children || nodeData.children.length === 0;
      if (isLeaf) {
        // only handle YouTube resources
        const res = resourceMap.get(nodeData.content);
        if (res && res.data.url) {
          event.stopPropagation();
          handleReset();
          onLeafClick(res.data.url);
        }
      }
    };
    
    svgRef.current.addEventListener('click', handleNodeClick);
    
    // Handle window resize
    const handleResize = () => {
      if (markmapRef.current) {
        markmapRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (svgRef.current) {
        svgRef.current.removeEventListener('click', handleNodeClick);
      }
      if (markmapRef.current) {
        markmapRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* 3D perspective wrapper */}
      <div 
        className={`relative flex-1 transition-all duration-500 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800/50 backdrop-blur-sm shadow-lg ${is3DView ? 'transform-style-3d perspective-1000' : ''}`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 opacity-80">
          <div className="absolute inset-0 opacity-20 bg-grid-zinc-600/20 bg-[size:20px_20px]"></div>
        </div>
        
        {/* SVG container with 3D transformation when enabled */}
        <div 
          className={`relative z-10 w-full h-full transition-transform duration-500 ${
            is3DView ? 'transform rotate3d(1, 0, 0, 20deg)' : ''
          }`}
        >
          <svg 
            ref={svgRef} 
            className="w-full h-full" 
            style={{
              cursor: 'pointer',
              textShadow: '0 0 5px rgba(165, 180, 252, 0.7)',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 500,
              fill: '#f4f4f5',
            }}
          />
        </div>
        
        {/* Controls overlay */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-zinc-800/90 p-2 rounded-lg border border-zinc-700 shadow-lg">
          <button 
            onClick={handleZoomIn} 
            className="p-2 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button 
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-zinc-300 hover:text-white transition-colors"
            aria-label="Reset view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
          <div className="border-t border-zinc-700 my-1"></div>
          <button 
            onClick={toggle3DView}
            className={`p-2 rounded-md transition-colors ${
              is3DView 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                : 'text-zinc-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white'
            }`}
            aria-label="Toggle 3D view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 12h3v8h14v-8h3L12 3z"></path>
              <path d="M12 8v13"></path>
            </svg>
          </button>
        </div>
        
        {/* Short instruction text */}
        <div className="absolute top-4 left-4 z-20 bg-zinc-900/80 text-xs text-zinc-400 py-1 px-2 rounded border border-zinc-700 backdrop-blur-sm">
          Click nodes to expand/collapse. Click leaf nodes for details. Drag to move.
        </div>
      </div>
    </div>
  );
}