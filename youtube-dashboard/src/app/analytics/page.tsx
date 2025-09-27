'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { videosApi } from '@/lib/api';
import { VideoStats } from '@/types';
import { motion } from 'framer-motion';
import { ChartBar as BarChart3, TrendingUp, Eye, Play, Zap } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await videosApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Layout onRefresh={fetchStats} isLoading={isLoading}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onRefresh={fetchStats} isLoading={isLoading}>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-purple-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive overview of YouTube content performance and trends
          </p>
        </motion.div>

        {stats && (
          <>
            {/* Main Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Videos</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalVideos)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Zap className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">YouTube Shorts</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalShorts)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Play className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Long-form Videos</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalLongForm)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Trending Now</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.trendingVideos)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-gray-700">YouTube Shorts</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{stats.percentageShorts}%</div>
                      <div className="text-sm text-gray-500">{formatNumber(stats.totalShorts)} videos</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${stats.percentageShorts}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Play className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-700">Long-form Videos</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{(100 - parseFloat(stats.percentageShorts)).toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">{formatNumber(stats.totalLongForm)} videos</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${100 - parseFloat(stats.percentageShorts)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Trending Content</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {stats.trendingVideos} videos are currently trending, representing{' '}
                      {((stats.trendingVideos / stats.totalVideos) * 100).toFixed(1)}% of all tracked content.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">Content Strategy</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {parseFloat(stats.percentageShorts) > 50 
                        ? 'Shorts dominate the content mix, indicating a focus on viral, short-form content.'
                        : 'Long-form content leads, suggesting emphasis on detailed, educational material.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top Outliers */}
            {stats.topOutliers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Outliers</h3>
                <div className="space-y-3">
                  {stats.topOutliers.slice(0, 5).map((video, index) => (
                    <div key={video.videoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 line-clamp-1">{video.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {formatNumber(video.views)}
                          </span>
                          <span className="flex items-center">
                            {video.isShort ? <Zap className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                            {video.isShort ? 'Short' : 'Long-form'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {video.outlierFactor.toFixed(1)}x
                        </div>
                        <div className="text-xs text-gray-500">outlier factor</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}