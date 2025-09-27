import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video } from '@/types';
import { formatNumber, formatTimeAgo, formatDuration, getOutlierColor, getYouTubeThumbnail } from '@/lib/utils';
import { Eye, Clock, TrendingUp, User, Sparkles } from 'lucide-react';
import Link from 'next/link';
import AISuggestionsModal from './AISuggestionsModal';

interface VideoCardProps {
  video: Video;
  index: number;
}

export default function VideoCard({ video, index }: VideoCardProps) {
  const thumbnailUrl = getYouTubeThumbnail(video.videoId, 'medium');
  const outlierColorClass = getOutlierColor(video.outlierFactor);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group relative"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = `https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=No+Image`;
          }}
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.lengthSeconds)}
        </div>

        {/* Short badge */}
        {video.isShort && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            SHORT
          </div>
        )}

        {/* Outlier badge */}
        {video.outlierFactor > 2 && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${outlierColorClass}`}>
            🔥 {video.outlierFactor.toFixed(1)}x
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 leading-tight">
          {video.title}
        </h3>

        {/* Channel */}
        <Link
          href={`/channel/${video.channelId}`}
          className="flex items-center text-gray-600 hover:text-red-600 transition-colors mb-3"
        >
          <User className="w-4 h-4 mr-1" />
          <span className="text-sm truncate">Channel</span>
        </Link>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Eye className="w-4 h-4 mr-1" />
              <span>{formatNumber(video.views)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{formatNumber(video.viewsPerHour)}/hr</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatTimeAgo(video.uploadTime)}</span>
            </div>
            {video.outlierFactor > 1 && (
              <div className={`px-2 py-1 rounded text-xs font-medium ${outlierColorClass}`}>
                {video.outlierFactor.toFixed(1)}x baseline
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestions Button */}
      <div className="absolute top-2 left-2">
        <button
          onClick={() => setShowAIModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="AI Ideas"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* AI Suggestions Modal */}
      <AISuggestionsModal
        video={video}
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </motion.div>
  );
}