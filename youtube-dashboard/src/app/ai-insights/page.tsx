'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { analyticsApi } from '@/lib/api';
import { TrendingNiche } from '@/types';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Eye, Hash, Zap } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function AIInsightsPage() {
  const [trends, setTrends] = useState<TrendingNiche[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch trends
      const trendsResponse = await analyticsApi.getTrends(7);
      setTrends(trendsResponse.data || []);
      
      // Fetch insights with fallback
      try {
        const insightsResponse = await analyticsApi.getInsights();
        setInsights(insightsResponse.data);
      } catch (error) {
        console.error('Error fetching insights:', error);
        // Set fallback insights
        setInsights({
          totalVideos: 0,
          viralVideos: 0,
          viralRate: '0',
          topPerformers: [],
          categoryBreakdown: []
        });
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setTrends([]);
      setInsights(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getHeatScoreColor = (score: number) => {
    if (score >= 10) return 'text-red-500 bg-red-50';
    if (score >= 5) return 'text-orange-500 bg-orange-50';
    if (score >= 2) return 'text-yellow-500 bg-yellow-50';
    return 'text-green-500 bg-green-50';
  };

  const getInsightIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Entertainment': '🎭',
      'Gaming': '🎮',
      'Music': '🎵',
      'Sports': '⚽',
      'Education': '📚',
      'Technology': '💻',
      'Comedy': '😂',
      'News': '📰',
      'Lifestyle': '✨',
      'Food': '🍕'
    };
    return icons[category] || '📹';
  };

  if (isLoading) {
    return (
      <Layout onRefresh={fetchData} isLoading={isLoading}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
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
    <Layout onRefresh={fetchData} isLoading={isLoading}>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Insights</h1>
          </div>
          <p className="text-gray-600">
            Discover trending niches and viral opportunities with AI-driven analytics
          </p>
        </motion.div>

        {/* Performance Overview */}
        {insights && (
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
                  <p className="text-sm font-medium text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(insights.totalVideos)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Viral Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(insights.viralVideos)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Viral Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.viralRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Hash className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hot Niches</p>
                  <p className="text-2xl font-bold text-gray-900">{trends.filter(t => t.heatScore > 5).length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trending Niches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">🔥 Hottest Niches (Last 7 Days)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trends.slice(0, 9).map((niche, index) => (
              <motion.div
                key={niche.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getInsightIcon(niche.category)}</span>
                    <h3 className="font-semibold text-gray-900">{niche.category}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHeatScoreColor(niche.heatScore)}`}>
                    🔥 {niche.heatScore}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Videos</span>
                    <span className="font-medium text-gray-900">{niche.count}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Views</span>
                    <span className="font-medium text-gray-900">{formatNumber(niche.avgViews)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Outlier</span>
                    <span className="font-medium text-orange-600">{niche.avgOutlier}x</span>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Views</span>
                      <span className="font-bold text-blue-600">{formatNumber(niche.totalViews)}</span>
                    </div>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-800">AI Insight</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    {niche.heatScore > 10 
                      ? `🚀 Extremely hot niche! ${niche.avgOutlier}x average performance suggests high viral potential.`
                      : niche.heatScore > 5
                      ? `📈 Growing niche with ${niche.count} trending videos. Good opportunity for content creators.`
                      : `💡 Stable niche with consistent performance. Consider unique angles to stand out.`
                    }
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white"
        >
          <div className="flex items-center mb-6">
            <Sparkles className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">AI Content Strategy Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="font-semibold mb-3">🎯 Focus Areas</h3>
              <ul className="space-y-2 text-sm">
                {trends.slice(0, 3).map(niche => (
                  <li key={niche.category} className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-2" />
                    {niche.category} ({niche.heatScore} heat score)
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="font-semibold mb-3">⚡ Quick Wins</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-2" />
                  Create Shorts in top 3 niches
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-2" />
                  Target 10x+ outlier topics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-2" />
                  Monitor velocity curves
                </li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-6">
              <h3 className="font-semibold mb-3">🔮 Predictions</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-2" />
                  {insights?.viralRate > 5 ? 'High viral potential detected' : 'Moderate growth expected'}
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-2" />
                  Best posting: Peak engagement hours
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-2" />
                  Trend duration: 3-7 days typical
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}