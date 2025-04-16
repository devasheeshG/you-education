"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { INode } from 'markmap-common';

// Create a custom type that makes children optional
type MindMapNode = {
  content: string;
  children?: MindMapNode[];
};

// Dummy data for the mindmap - structured as an exam with topics and subtopics
const examData: MindMapNode = {
  content: 'Biology Exam',
  children: [
    {
      content: 'Cell Biology',
      children: [
        { content: 'Cell Structure' },
        { content: 'Cell Function' },
        { 
          content: 'Cell Division', 
          children: [
            { content: 'Mitosis' },
            { content: 'Meiosis' }
          ] 
        }
      ]
    },
    {
      content: 'Genetics',
      children: [
        { content: 'Inheritance' },
        { content: 'DNA Structure' },
        { content: 'Gene Expression' }
      ]
    },
    {
      content: 'Ecology',
      children: [
        { content: 'Ecosystems' },
        { content: 'Population Dynamics' },
        { content: 'Environmental Impact' }
      ]
    }
  ]
};

// Helper functions moved outside of the component
function childToMarkdown(node: MindMapNode, level: number): string {
  const heading = '#'.repeat(level);
  let markdown = `${heading} ${node.content}\n`;
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      markdown += childToMarkdown(child, level + 1);
    });
  }
  
  return markdown;
}

function examDataToMarkdown(node: MindMapNode): string {
  let markdown = `# ${node.content}\n`;
  
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      markdown += childToMarkdown(child, 2);
    });
  }
  
  return markdown;
}

// Function to transform our custom data structure to the format required by markmap
const transformer = new Transformer();

export default function MindmapPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !svgRef.current) return;
    
    // Clean up any existing markmap
    if (markmapRef.current) {
      markmapRef.current.destroy();
    }
    
    // Transform our data to the format expected by markmap
    const { root } = transformer.transform(examDataToMarkdown(examData));
    
    // Create the markmap with minimalist black and white theme
    const mm = Markmap.create(svgRef.current, {
      autoFit: true, // Automatically fits the mindmap to the viewport
      initialExpandLevel: 1, // Only expand the first level (root and immediate children)
      color: (node: INode) => {
        // Use monochromatic grayscale color scheme
        const colors = ['#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a'];
        const depth = node.state?.depth || 0;
        return colors[Math.min(depth, colors.length - 1)];
      },
      paddingX: 16, // Add more horizontal padding
    }, root);
    
    markmapRef.current = mm;
    
    // Handle window resize
    const handleResize = () => {
      if (markmapRef.current) {
        markmapRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (markmapRef.current) {
        markmapRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full h-screen bg-background rounded-md border border-border p-4">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}