'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { videosApi } from '@/lib/api';
import { Video } from '@/types';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Clock, Zap, Play } from 'lucide-react';
import { formatNumber, formatTimeAgo, formatDuration, getOutlierColor, getYouTubeThumbnail } from '@/lib/utils';
import Link from 'next/link';

export default function OutliersPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOutliers = async () => {
    try {
      setIsLoading(true);
      const response = await videosApi.getOutliers(100);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching outliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutliers();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchOutliers, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Layout onRefresh={fetchOutliers} isLoading={isLoading}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-20 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="flex space-x-4">
                        <div className="h-3 bg-gray-200 rounded w-16" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onRefresh={fetchOutliers} isLoading={isLoading}>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Outlier Videos</h1>
          </div>
          <p className="text-gray-600">
            Videos performing significantly above their channel's baseline
          </p>
        </motion.div>

        {/* Outliers Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views/Hour
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outlier Factor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {videos.map((video, index) => {
                  const thumbnailUrl = getYouTubeThumbnail(video.videoId, 'default');
                  const outlierColorClass = getOutlierColor(video.outlierFactor);

                  return (
                    <motion.tr
                      key={video.videoId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={thumbnailUrl}
                              alt={video.title}
                              className="w-20 h-12 object-cover rounded"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = `https://via.placeholder.com/120x90/f3f4f6/9ca3af?text=No+Image`;
                              }}
                            />
                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                              {formatDuration(video.lengthSeconds)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {video.title}
                            </p>
                            <Link
                              href={`/channel/${video.channelId}`}
                              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                            >
                              View Channel
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {video.isShort ? (
                            <div className="flex items-center text-red-600">
                              <Zap className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">Short</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-blue-600">
                              <Play className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">Long-form</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-900">
                          <Eye className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-sm font-medium">{formatNumber(video.views)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-900">
                          <TrendingUp className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-sm font-medium">{formatNumber(video.viewsPerHour)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${outlierColorClass}`}>
                          🔥 {video.outlierFactor.toFixed(1)}x
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">{formatTimeAgo(video.uploadTime)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {videos.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">No outliers found</div>
            <div className="text-gray-500 text-sm">Check back later for viral content</div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}