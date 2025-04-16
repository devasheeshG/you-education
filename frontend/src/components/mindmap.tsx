"use client";

import React, { useEffect, useRef } from 'react';
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
    
    // Create the markmap
    const mm = Markmap.create(svgRef.current, {
      autoFit: true, // Automatically fits the mindmap to the viewport
      initialExpandLevel: 1, // Only expand the first level (root and immediate children)
      color: (node: INode) => {
        // Customize colors based on node depth or content
        const colors = ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'];
        const depth = node.state?.depth || 0;
        return colors[Math.min(depth, colors.length - 1)];
      },
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

  // Convert our data structure to markdown format that markmap can understand
  const examDataToMarkdown = (node: MindMapNode): string => {
    let markdown = `# ${node.content}\n`;
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        // Convert each child to markdown with increased heading level
        const childMarkdown = childToMarkdown(child, 2);
        markdown += childMarkdown;
      });
    }
    
    return markdown;
  };
  
  // Helper function to convert child nodes to markdown with proper heading levels
  const childToMarkdown = (node: MindMapNode, level: number): string => {
    // Create the appropriate heading based on level (e.g., ##, ###, etc.)
    const heading = '#'.repeat(level);
    let markdown = `${heading} ${node.content}\n`;
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        // Recursively convert each child to markdown with increased heading level
        const childMarkdown = childToMarkdown(child, level + 1);
        markdown += childMarkdown;
      });
    }
    
    return markdown;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold my-4">Exam Mindmap</h1>
      <div className="w-full h-screen bg-white rounded-lg shadow-md p-4">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}