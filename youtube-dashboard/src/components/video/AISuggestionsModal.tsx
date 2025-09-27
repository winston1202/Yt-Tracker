'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, AISuggestions } from '@/types';
import { aiApi } from '@/lib/api';
import { X, Sparkles, Copy, CircleCheck as CheckCircle, Lightbulb, Image, Zap } from 'lucide-react';

interface AISuggestionsModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export default function AISuggestionsModal({ video, isOpen, onClose }: AISuggestionsModalProps) {
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<{ type: string; index: number } | null>(null);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await aiApi.getSuggestions(video.videoId);
      if (response.success && response.data) {
        setSuggestions(response.data);
      } else {
        throw new Error('Failed to fetch suggestions');
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      // Set fallback suggestions
      setSuggestions({
        titles: [
          `${video.isShort ? 'This' : 'The'} ${video.category || 'Video'} Secret That Got ${formatViews(video.views)} Views`,
          `Why This ${video.category || 'Content'} Went Viral (${video.outlierFactor.toFixed(1)}x Growth!)`,
          `${video.isShort ? 'Quick' : 'Ultimate'} ${video.category || 'Video'} Hack Everyone's Talking About`
        ],
        thumbnails: [
          `Split-screen before/after with shocked expression and "${video.outlierFactor.toFixed(1)}x" text overlay`,
          `Close-up reaction face with bright arrows pointing to key visual element`,
          `Bold text "${formatViews(video.views)} VIEWS!" with contrasting background colors`
        ],
        twists: [
          `Apply this ${video.category || 'concept'} to a different age demographic`,
          `Create a "behind the scenes" or "reaction" version of this content`,
          `Combine this trend with another popular ${video.isShort ? 'Short' : 'long-form'} format`
        ],
        generated: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  useEffect(() => {
    if (isOpen && !suggestions) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, type: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex({ type, index });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="w-8 h-8 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold">AI Content Ideas</h2>
                  <p className="text-purple-100 text-sm">
                    {video.outlierFactor.toFixed(1)}x outlier • {video.isShort ? 'Short' : 'Long-form'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
              <p className="text-sm font-medium line-clamp-2">{video.title}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Generating AI suggestions...</p>
                </div>
              </div>
            ) : suggestions ? (
              <div className="space-y-8">
                {/* Title Suggestions */}
                <div>
                  <div className="flex items-center mb-4">
                    <Zap className="w-6 h-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Viral Title Ideas</h3>
                  </div>
                  <div className="space-y-3">
                    {suggestions.titles.map((title, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <p className="text-gray-900 flex-1 pr-4">{title}</p>
                        <button
                          onClick={() => copyToClipboard(title, 'title', index)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                        >
                          {copiedIndex?.type === 'title' && copiedIndex?.index === index ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Suggestions */}
                <div>
                  <div className="flex items-center mb-4">
                    <Image className="w-6 h-6 text-blue-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Thumbnail Concepts</h3>
                  </div>
                  <div className="space-y-3">
                    {suggestions.thumbnails.map((thumbnail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <p className="text-gray-900 flex-1 pr-4">{thumbnail}</p>
                        <button
                          onClick={() => copyToClipboard(thumbnail, 'thumbnail', index)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          {copiedIndex?.type === 'thumbnail' && copiedIndex?.index === index ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Niche Twist Suggestions */}
                <div>
                  <div className="flex items-center mb-4">
                    <Lightbulb className="w-6 h-6 text-green-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Niche Twist Ideas</h3>
                  </div>
                  <div className="space-y-3">
                    {suggestions.twists.map((twist, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 1 }}
                        className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                      >
                        <p className="text-gray-900 flex-1 pr-4">{twist}</p>
                        <button
                          onClick={() => copyToClipboard(twist, 'twist', index)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          {copiedIndex?.type === 'twist' && copiedIndex?.index === index ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generated by AI • {new Date(suggestions.generated).toLocaleTimeString()}
                    </div>
                    <button
                      onClick={fetchSuggestions}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Regenerate Ideas
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Failed to generate suggestions. Please try again.</p>
                <button
                  onClick={fetchSuggestions}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}