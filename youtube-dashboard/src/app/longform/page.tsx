'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import VideoGrid from '@/components/video/VideoGrid';
import { videosApi } from '@/lib/api';
import { Video } from '@/types';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Clock } from 'lucide-react';

export default function LongFormPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, trending: 0, avgDuration: 0 });

  const fetchLongForm = async () => {
    try {
      setIsLoading(true);
      const response = await videosApi.getLongForm({ limit: 50 });
      setVideos(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const trending = response.data.filter(v => v.trending).length;
      const avgDuration = total > 0 ? response.data.reduce((sum, v) => sum + v.lengthSeconds, 0) / total : 0;
      
      setStats({ total, trending, avgDuration });
    } catch (error) {
      console.error('Error fetching long-form videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLongForm();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLongForm, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Layout onRefresh={fetchLongForm} isLoading={isLoading}>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Play className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Long-Form Videos Trending</h1>
          </div>
          <p className="text-gray-600">
            Explore trending long-form content with detailed performance analytics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgDuration > 0 ? formatDuration(stats.avgDuration) : '0m'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Videos Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <VideoGrid videos={videos} isLoading={isLoading} />
        </motion.div>
      </div>
    </Layout>
  );
}