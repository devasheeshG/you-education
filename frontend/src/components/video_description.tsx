'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MetaData {
  title: string;
  description: string;
}

interface VideoDescriptionProps {
  url: string;
}

const VideoDescription: React.FC<VideoDescriptionProps> = ({ url }) => {
  const [data, setData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/proxy/metadata/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) throw new Error('Fetch error');
        const json = await res.json();
        setData({ title: json.title, description: json.description });
      } catch (e) {
        console.error('Failed to load video metadata', e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [url]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <p className="text-zinc-400">Unable to load video description.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-zinc-700 bg-zinc-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm">
      <h3 className="font-bold text-xl text-zinc-100 mb-2">{data.title}</h3>
      <p className="text-zinc-300 leading-relaxed">{data.description}</p>
    </motion.div>
  );
};

export default VideoDescription;