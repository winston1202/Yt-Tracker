'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import VideoGrid from '@/components/video/VideoGrid';
import { videosApi, Video } from '@/lib/api';
import { Zap, TrendingUp, Eye } from 'lucide-react';

export default function ShortsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, trending: 0, avgViews: 0 });

  const fetchShorts = async () => {
    try {
      setIsLoading(true);
      const response = await videosApi.getShorts({ limit: 50 });
      setVideos(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const trending = response.data.filter(v => v.trending).length;
      const avgViews = total > 0 ? response.data.reduce((sum, v) => sum + v.views, 0) / total : 0;
      
      setStats({ total, trending, avgViews });
    } catch (error) {
      console.error('Error fetching shorts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, []);

  return (
    <Layout onRefresh={fetchShorts} isLoading={isLoading}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Zap className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">YouTube Shorts Trending</h1>
          </div>
          <p className="text-gray-600">
            Discover the hottest YouTube Shorts with real-time performance metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shorts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgViews > 0 ? (stats.avgViews / 1000).toFixed(1) + 'K' : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <VideoGrid videos={videos} isLoading={isLoading} />
      </div>
    </Layout>
  );
}