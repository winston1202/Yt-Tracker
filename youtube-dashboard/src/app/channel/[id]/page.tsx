'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import PerformanceChart from '@/components/charts/PerformanceChart';
import VideoGrid from '@/components/video/VideoGrid';
import { channelsApi } from '@/lib/api';
import { Channel, Video } from '@/types';
import { motion } from 'framer-motion';
import { User, Users, Eye, Video as VideoIcon, Calendar, TrendingUp } from 'lucide-react';
import { formatNumber, formatTimeAgo } from '@/lib/utils';

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.id as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChannelData = async () => {
    try {
      setIsLoading(true);
      const [channelResponse, videosResponse] = await Promise.all([
        channelsApi.getById(channelId),
        channelsApi.getVideos(channelId, { limit: 20, sortBy: 'views' })
      ]);
      
      setChannel(channelResponse.data);
      setVideos(videosResponse.data);
    } catch (error) {
      console.error('Error fetching channel data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchChannelData();
    }
  }, [channelId]);

  if (isLoading) {
    return (
      <Layout onRefresh={fetchChannelData} isLoading={isLoading}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
            <div className="h-80 bg-gray-200 rounded-xl mb-8" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!channel) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">Channel not found</div>
            <div className="text-gray-500 text-sm">The channel may not exist or hasn't been tracked yet</div>
          </div>
        </div>
      </Layout>
    );
  }

  const channelAge = new Date().getFullYear() - new Date(channel.channelAge).getFullYear();

  return (
    <Layout onRefresh={fetchChannelData} isLoading={isLoading}>
      <div className="p-6">
        {/* Channel Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-8 text-white mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{channel.channelName}</h1>
              <p className="text-red-100 mb-4 line-clamp-2">
                {channel.description || 'No description available'}
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{formatNumber(channel.subscriberCount)} subscribers</span>
                </div>
                <div className="flex items-center">
                  <VideoIcon className="w-4 h-4 mr-1" />
                  <span>{formatNumber(channel.uploadCount)} videos</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{channelAge} years old</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(channel.totalViews)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Views (Last 5)</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(channel.avgViewsLast5)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <VideoIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shorts</p>
                <p className="text-2xl font-bold text-gray-900">{channel.shortsCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <VideoIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Long-form</p>
                <p className="text-2xl font-bold text-gray-900">{channel.longFormCount || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Chart */}
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
            <PerformanceChart videos={videos.slice(0, 10)} />
          </motion.div>
        )}

        {/* Recent Videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Videos</h2>
            <div className="text-sm text-gray-500">
              Last updated: {formatTimeAgo(channel.lastUpdated)}
            </div>
          </div>
          <VideoGrid videos={videos} />
        </motion.div>
      </div>
    </Layout>
  );
}