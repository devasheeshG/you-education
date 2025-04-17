'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { getExamReferences, Reference } from '../app/api/references';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat: React.FC = () => {
  // ensure examId is always a string
  const params = useParams();
  const rawId = params.id;
  const examId = Array.isArray(rawId) ? rawId[0] : rawId || '';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! How can I help you with your exam preparation today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [allReferences, setAllReferences] = useState<Reference[]>([]);
  const [addedReferences, setAddedReferences] = useState<Reference[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        text: 'I\'ve noted your question. Is there anything specific about this topic you\'d like to explore further?',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  // Load all exam references on mount or when examId changes
  useEffect(() => {
    if (!examId) return;
    getExamReferences(examId)
      .then(data => setAllReferences(data.references))
      .catch(err => console.error('Error fetching references', err));
  }, [examId]);

  // Open modal to add references
  const handleAddReference = () => setIsModalOpen(true);

  // Select an existing reference
  const handleSelectReference = (ref: Reference) => {
    setAddedReferences(prev => [...prev, ref]);
    setIsModalOpen(false);
  };

  // Remove an added reference
  const handleRemoveReference = (id: string) => {
    setAddedReferences(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full border border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/50 backdrop-blur-sm shadow-lg">
      {/* Header */}
      <div className="p-3 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-900/30 p-1.5 rounded-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <span className="font-medium text-zinc-100">AI Chat Assistant</span>
        </div>
        <span className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full px-2 py-1">Online</span>
      </div>

      {/* Chat and References Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-100'
                }`}
              >
                <p className="text-sm md:text-base">{message.text}</p>
                <div className="text-xs mt-2 opacity-70 flex justify-end">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* References panel */}
        <aside className="w-64 bg-zinc-900 border-l border-zinc-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-100">References</h3>
            <button onClick={handleAddReference} className="text-indigo-400 hover:text-indigo-300 text-xl">+</button>
          </div>
          <ul className="space-y-2">
            {addedReferences.map(ref => (
              <li key={ref.id} className="flex justify-between items-center">
                <a href="#" className="block p-2 rounded hover:bg-zinc-800 text-zinc-200 flex-1">
                  {ref.name}
                </a>
                <button
                  onClick={() => handleRemoveReference(ref.id)}
                  className="ml-2 text-red-500 hover:text-red-400 text-sm"
                  title="Remove reference"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {/* Modal for selecting references */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-zinc-800 p-6 rounded-md w-80">
              <h4 className="text-white mb-4">Select Reference</h4>
              <ul className="max-h-40 overflow-y-auto mb-4 space-y-2">
                {allReferences.filter(r => !addedReferences.some(a => a.id === r.id)).map(ref => (
                  <li key={ref.id}>
                    <button
                      onClick={() => handleSelectReference(ref)}
                      className="w-full text-left p-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                    >
                      {ref.name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-3 py-1 bg-gray-600 text-white rounded">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question about this exam..."
            className="flex-1 p-3 rounded-md border border-zinc-700 bg-zinc-800/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-100"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            disabled={!newMessage.trim()}
          >
            <span>Send</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
              <path d="M22 2L11 13"></path>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default Chat;