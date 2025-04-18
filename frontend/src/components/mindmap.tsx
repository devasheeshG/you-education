"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { INode } from 'markmap-common';

// Dummy API response types and data
type ApiResource = { id: string; data: { url?: string; content?: string; /* other data */ } };
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
            { title: 'Quadratic Equations Guide', is_end_node: true, type: 'Notes', resource: { id: 'm2', data: { content: `## Quadratic Equations Guide

This guide covers solving quadratic equations using factoring, completing the square, and the quadratic formula.

- Factoring
- Completing the square
- Quadratic formula` } } }
          ]
        },
        {
          title: 'Calculus',
          is_end_node: false,
          subtopics: [
            { title: 'Limits Explained', is_end_node: true, type: 'youtube_video', resource: { id: 'm3', data: { url: 'https://www.youtube.com/watch?v=AX6OrbgS8lI' } } },
            { title: 'Derivatives Summary', is_end_node: true, type: 'Notes', resource: { id: 'm4', data: { content: `## Derivatives Summary

A derivative represents the rate of change of a function:

\`f'(x) = \lim_{h\to0} \frac{f(x+h)-f(x)}{h}\`

Use power rule, product rule, and chain rule.` } } },
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
            { title: 'Dynamics Notes', is_end_node: true, type: 'Notes', resource: { id: 'p2', data: { content: `## Dynamics Notes

Dynamics studies forces and motion:

- Newton's laws of motion
- Free body diagrams
- Applications in engineering` } } }
          ]
        },
        {
          title: 'Optics',
          is_end_node: false,
          subtopics: [
            { title: 'Reflection Principles', is_end_node: true, type: 'youtube_video', resource: { id: 'p3', data: { url: 'https://www.youtube.com/watch?v=4TIGwaBHuzg' } } },
            { title: 'Refraction Explained', is_end_node: true, type: 'youtube_video', resource: { id: 'p4', data: { url: 'hhttps://www.youtube.com/watch?v=4TIGwaBHuzg' } } },
            { title: 'Wave Optics Notes', is_end_node: true, type: 'Notes', resource: { id: 'p5', data: { content: `## Wave Optics Notes

Wave optics deals with diffraction, interference, and polarization:

1. Interference patterns
2. Double-slit experiment
3. Polarization concepts` } } }
          ]
        }
      ]
    }
  ]
};

// Map to store ApiNode resources by lowercased trimmed title
const resourceMap = new Map<string, ApiNode>();

// Create a custom type that makes children optional
// type MindMapNode = {
//   content: string;
//   children?: MindMapNode[];
//   isLeaf?: boolean; // Add this to track leaf nodes
// };

// Helper functions moved outside of the component
// function childToMarkdown(node: MindMapNode, level: number): string {
//   const heading = '#'.repeat(level);
//   let markdown = `${heading} ${node.content}\n`;
  
//   // Add a data attribute to identify leaf nodes in the Markdown
//   if (node.isLeaf) {
//     markdown = `${heading} ${node.content} <!-- isLeaf -->\n`;
//   }
  
//   if (node.children && node.children.length > 0) {
//     node.children.forEach(child => {
//       markdown += childToMarkdown(child, level + 1);
//     });
//   }
  
//   return markdown;
// }

// Convert API JSON to markdown and populate resourceMap
function apiToMarkdown(node: ApiNode, level = 1): string {
  // Track all leaf-node resources using lowercased title key
  if (node.is_end_node && node.resource) {
    const key = node.title.trim().toLowerCase();
    resourceMap.set(key, node);
  }
  let md = `${'#'.repeat(level)} ${node.title}\n`;
  if (node.subtopics) {
    node.subtopics.forEach(child => {
      md += apiToMarkdown(child, level + 1);
    });
  }
  return md;
}

export default function MindmapPage({ onLeafClick }: { onLeafClick: (selection: { type?: string; title: string; resource: ApiResource }) => void }) {
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
      // Use a simple empty style as we'll apply styles separately
      style: (id) => { return ''; }
    }, root);

    // Store the reference
    markmapRef.current = mm;
    
    // Function to apply styles to all nodes - will run initially and after any updates
    const applyStyles = () => {
      if (!svgRef.current) return;
      
      // Apply text styles with !important to override any existing styles
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .markmap-node-text {
          fill: #ffffff !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
        }
        .markmap-link {
          stroke: #6366f1 !important;
          stroke-width: 1.5px !important;
          stroke-opacity: 0.75 !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      // Use proper type casting for SVG elements
      svgRef.current.querySelectorAll('.markmap-node-text').forEach(el => {
        // Cast Element to SVGElement to access attributes correctly
        const svgEl = el as SVGElement;
        svgEl.setAttribute('fill', '#ffffff');
        svgEl.setAttribute('font-size', '14px');
        svgEl.setAttribute('font-weight', '500');
        
        // For HTML elements with style property, use type assertion
        const htmlEl = el as unknown as HTMLElement;
        if (htmlEl.style) {
          htmlEl.style.textShadow = '0 1px 3px rgba(0,0,0,0.8)';
          // Force a repaint
          htmlEl.style.display = 'none';
          void htmlEl.offsetHeight; // trigger reflow
          htmlEl.style.display = '';
        }
      });

      svgRef.current.querySelectorAll('.markmap-link').forEach(el => {
        // Cast to SVGElement for setAttribute
        (el as SVGElement).setAttribute('stroke', '#6366f1');
        (el as SVGElement).setAttribute('stroke-width', '1.5px');
        (el as SVGElement).setAttribute('stroke-opacity', '0.75');
      });
    };

    // Apply styles initially
    applyStyles();

    // Use a MutationObserver to detect changes and apply styles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && svgRef.current && svgRef.current.contains(mutation.target as Node)) {
          applyStyles();
        }
      });
    });

    // Start observing the SVG element for changes
    if (svgRef.current) {
      observer.observe(svgRef.current, {
        childList: true,
        subtree: true
      });
    }
    
    // Add click event listener to the SVG element
    const handleNodeClick = (event: MouseEvent) => {
      const nodeG = (event.target as Element).closest('g.markmap-node') as SVGGElement;
      if (!nodeG) return;
      const nodeData = (nodeG as any).__data__ as INode;
      const isLeaf = !nodeData.children || nodeData.children.length === 0;
      if (isLeaf) {
        const titleKey = nodeData.content.trim().toLowerCase();
        const nodeRecord = resourceMap.get(titleKey);
        if (nodeRecord && nodeRecord.resource) {
          event.stopPropagation();
          handleReset();
          onLeafClick({
            type: nodeRecord.type,
            title: nodeRecord.title,
            resource: nodeRecord.resource
          });
        } else {
          console.warn('No resource found for leaf:', nodeData.content);
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
      // Clean up the style element on unmount
      document.querySelectorAll('style').forEach(style => {
        if (style.textContent?.includes('.markmap-node-text')) {
          style.remove();
        }
      });
      // observer disconnect
      observer.disconnect();
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
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 500,
              fill: '#ffffff', // White fill for all text
              filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))', // Add drop shadow for better contrast
              color: '#ffffff' // Ensure SVG text color is white
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