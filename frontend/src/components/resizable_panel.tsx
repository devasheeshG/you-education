'use client';
import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  direction: 'horizontal' | 'vertical';
  initialSize?: number; // Initial size in pixels or percentage
  minSize?: number; // Minimum size in pixels
  maxSize?: number; // Maximum size in pixels
  className?: string;
  sidebarPosition?: 'left' | 'right' | 'top' | 'bottom';
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction = 'horizontal',
  initialSize = 300,
  minSize = 200,
  maxSize = 800,
  className = '',
  sidebarPosition = 'right',
}) => {
  const isHorizontal = direction === 'horizontal';
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  
  // Set the resizer cursor based on direction
  const resizerClass = isHorizontal
    ? 'w-1.5 cursor-col-resize hover:w-2 hover:bg-indigo-500 active:bg-indigo-600'
    : 'h-1.5 cursor-row-resize hover:h-2 hover:bg-indigo-500 active:bg-indigo-600';

  // Handle mouse events for resizing
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newSize;
      if (isHorizontal) {
        // Calculate new width based on mouse position and sidebar position
        if (sidebarPosition === 'right') {
          newSize = containerRect.right - e.clientX;
        } else {
          newSize = e.clientX - containerRect.left;
        }
      } else {
        // Calculate new height based on mouse position and sidebar position
        if (sidebarPosition === 'bottom') {
          newSize = containerRect.bottom - e.clientY;
        } else {
          newSize = e.clientY - containerRect.top;
        }
      }
      
      // Constrain to min/max bounds
      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isHorizontal, minSize, maxSize, sidebarPosition]);

  // Apply appropriate styles based on direction and sidebar position
  const getContainerStyle = () => {
    if (isHorizontal) {
      return sidebarPosition === 'right'
        ? { width: `${size}px` }
        : { width: `${size}px`, marginLeft: '0' };
    } else {
      return sidebarPosition === 'bottom'
        ? { height: `${size}px` }
        : { height: `${size}px`, marginTop: '0' };
    }
  };

  const getResizerPosition = () => {
    if (isHorizontal) {
      return sidebarPosition === 'right'
        ? 'left-0 top-0 bottom-0 -translate-x-1/2'
        : 'right-0 top-0 bottom-0 translate-x-1/2';
    } else {
      return sidebarPosition === 'bottom'
        ? 'top-0 left-0 right-0 -translate-y-1/2'
        : 'bottom-0 left-0 right-0 translate-y-1/2';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      style={getContainerStyle()}
    >
      <div className="flex-1 overflow-hidden">{children}</div>
      
      <div
        ref={resizerRef}
        className={`absolute z-10 bg-gray-300 bg-opacity-50 transition-all duration-200 ${resizerClass} ${getResizerPosition()}`}
        onMouseDown={startResizing}
      />
    </div>
  );
};

export default ResizablePanel;