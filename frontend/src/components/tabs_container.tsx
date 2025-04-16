'use client';
import React, { useState, ReactNode } from 'react';

interface TabsContainerProps {
  children: {
    [key: string]: ReactNode;
  };
  defaultActive?: string;
  className?: string;
}

const TabsContainer: React.FC<TabsContainerProps> = ({ 
  children, 
  defaultActive,
  className = ''
}) => {
  const tabKeys = Object.keys(children);
  const [activeTab, setActiveTab] = useState(defaultActive || tabKeys[0]);

  return (
    <div className={`flex flex-col h-full glassmorphism overflow-hidden ${className}`}>
      <div className="flex border-b border-gray-800 bg-gray-900 bg-opacity-60">
        {tabKeys.map((tabKey) => (
          <button
            key={tabKey}
            className={`px-6 py-3 font-medium text-sm transition-all ${
              activeTab === tabKey
                ? 'bg-opacity-80 bg-gradient-to-b from-blue-600 to-indigo-900 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:bg-opacity-40'
            }`}
            onClick={() => setActiveTab(tabKey)}
          >
            <div className="flex items-center gap-2">
              {getTabIcon(tabKey)}
              {tabKey}
            </div>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {children[activeTab]}
      </div>
    </div>
  );
};

// Helper function to get icons for tabs
function getTabIcon(tabName: string): React.ReactNode {
  switch (tabName.toLowerCase()) {
    case 'mindmap':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6Z" fill="currentColor"/>
          <path d="M6 12C7.10457 12 8 11.1046 8 10C8 8.89543 7.10457 8 6 8C4.89543 8 4 8.89543 4 10C4 11.1046 4.89543 12 6 12Z" fill="currentColor"/>
          <path d="M18 12C19.1046 12 20 11.1046 20 10C20 8.89543 19.1046 8 18 8C16.8954 8 16 8.89543 16 10C16 11.1046 16.8954 12 18 12Z" fill="currentColor"/>
          <path d="M12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20C10 21.1046 10.8954 22 12 22Z" fill="currentColor"/>
          <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case 'chat':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'references':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}

export default TabsContainer;