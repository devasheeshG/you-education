"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { INode } from 'markmap-common';
import { getMindmap, MindmapNode } from '../app/api/mindmap';

// Updated API response types and data structure
type ApiResource = { type: string; data: { url?: string; title: string; description?: string } };
type ApiNode = {
  title: string;
  is_last_subtopic: boolean;
  subtopics?: ApiNode[];
  resources?: ApiResource[];
};

// Map to store ApiNode resources by lowercased trimmed title
const resourceMap = new Map<string, ApiNode>();

// Convert API JSON to markdown and populate resourceMap
function apiToMarkdown(node: ApiNode, level = 1): string {
  if (node.is_last_subtopic && node.resources) {
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

export default function MindmapPage({ onLeafClick }: { 
  onLeafClick: (selection: { type?: string; title: string; resource: ApiResource }) => void
}) {
  const params = useParams();
  const examId = params.id as string || "default";
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const transformer = new Transformer();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [is3DView, setIs3DView] = useState(false);
  const [apiData, setApiData] = useState<ApiNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch mindmap data
  useEffect(() => {
    const fetchMindmap = async () => {
      try {
        setIsLoading(true);
        const response = await getMindmap(examId);
        setApiData(response.mindmap);
        setError(null);
      } catch (err) {
        console.error("Error fetching mindmap:", err);
        setError("Failed to load mindmap data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMindmap();
  }, [examId]);

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
    // Only run on client side and when data is available
    if (typeof window === 'undefined' || !svgRef.current || !apiData) return;
    
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
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#e879f9'];
        const depth = node.state?.depth || 0;
        return colors[Math.min(depth, colors.length - 1)];
      },
      paddingX: 16,
      duration: 500,
      style: (id) => { return ''; }
    }, root);

    markmapRef.current = mm;

    // Apply styles and set up event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
      applyStyles(svgRef);
      
      // Define the click handler first
      const handleNodeClick = (event: MouseEvent) => {
        console.log('SVG clicked:', event.target);
        
        const nodeG = (event.target as Element).closest('g.markmap-node') as SVGGElement;
        if (!nodeG) {
          console.log('No node element found');
          return;
        }
        
        console.log('Node element found:', nodeG);
        const nodeData = (nodeG as any).__data__ as INode;
        console.log('Node data:', nodeData);
        
        const isLeaf = !nodeData.children || nodeData.children.length === 0;
        console.log('Is leaf node:', isLeaf);
        
        if (isLeaf) {
          const titleKey = nodeData.content.trim().toLowerCase();
          const nodeRecord = resourceMap.get(titleKey);
          
          console.log('Leaf node clicked:', {
            content: nodeData.content,
            titleKey: titleKey,
            nodeRecordFound: !!nodeRecord
          });
          
          if (nodeRecord && nodeRecord.resources) {
            console.log('Resources found:', {
              title: nodeRecord.title,
              resourceCount: nodeRecord.resources.length,
              resources: nodeRecord.resources
            });
            
            event.stopPropagation();
            
            if (svgRef.current) {
              svgRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
            handleReset();
            onLeafClick({
              type: nodeRecord.resources[0].type,
              title: nodeRecord.title,
              resource: nodeRecord.resources[0]
            });
            handleReset();
          } else {
            console.warn('No resource found for leaf:', {
              content: nodeData.content, 
              availableKeys: Array.from(resourceMap.keys())
            });
          }
        } else {
          console.log('Non-leaf node clicked:', nodeData.content);
        }
      };
      
      // Add the event listener with our handler
      if (svgRef.current) {
        svgRef.current.addEventListener('click', handleNodeClick);
      }
      
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
        document.querySelectorAll('style').forEach(style => {
          if (style.textContent?.includes('.markmap-node-text')) {
            style.remove();
          }
        });
        observer.disconnect();
      };
    }, 500);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && svgRef.current && svgRef.current.contains(mutation.target as Node)) {
          applyStyles(svgRef);
        }
      });
    });

    if (svgRef.current) {
      observer.observe(svgRef.current, {
        childList: true,
        subtree: true
      });
    }
    
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
      document.querySelectorAll('style').forEach(style => {
        if (style.textContent?.includes('.markmap-node-text')) {
          style.remove();
        }
      });
      observer.disconnect();
      observer.disconnect();
    };
  }, [apiData, handleReset, onLeafClick]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !apiData) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-red-500 p-4 bg-red-100 rounded-lg">
          {error || "No mindmap data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <div 
        className={`relative flex-1 transition-all duration-500 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800/50 backdrop-blur-sm shadow-lg ${is3DView ? 'transform-style-3d perspective-1000' : ''}`}
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 opacity-80">
          <div className="absolute inset-0 opacity-20 bg-grid-zinc-600/20 bg-[size:20px_20px]"></div>
        </div>
        
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
              fill: '#ffffff',
              filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))',
              color: '#ffffff'
            }}
          />
        </div>
        
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
        
        <div className="absolute top-4 left-4 z-20 bg-zinc-900/80 text-xs text-zinc-400 py-1 px-2 rounded border border-zinc-700 backdrop-blur-sm">
          Click nodes to expand/collapse. Click leaf nodes for details. Drag to move.
        </div>
      </div>
    </div>
  );
}

function applyStyles(svgRef: React.RefObject<SVGSVGElement | null>) {
  if (!svgRef.current) return;
  
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
  
  svgRef.current.querySelectorAll('.markmap-node-text').forEach(el => {
    const svgEl = el as SVGElement;
    svgEl.setAttribute('fill', '#ffffff');
    svgEl.setAttribute('font-size', '14px');
    svgEl.setAttribute('font-weight', '500');
    
    const htmlEl = el as unknown as HTMLElement;
    if (htmlEl.style) {
      htmlEl.style.textShadow = '0 1px 3px rgba(0,0,0,0.8)';
      htmlEl.style.display = 'none';
      void htmlEl.offsetHeight;
      htmlEl.style.display = '';
    }
  });

  svgRef.current.querySelectorAll('.markmap-link').forEach(el => {
    (el as SVGElement).setAttribute('stroke', '#6366f1');
    (el as SVGElement).setAttribute('stroke-width', '1.5px');
    (el as SVGElement).setAttribute('stroke-opacity', '0.75');
  });
}

function handleNodeClick(this: SVGSVGElement, ev: MouseEvent) {
  throw new Error('Function not implemented.');
}
