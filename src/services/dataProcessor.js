const Video = require('../models/Video');
const Channel = require('../models/Channel');
const youtubeService = require('./youtubeService');

class DataProcessor {
  
  // Calculate outlier factor for videos
  async calculateOutlierFactors() {
    try {
      const videos = await Video.find({}).populate('channelId');
      
      for (const video of videos) {
        const channel = await Channel.findOne({ channelId: video.channelId });
        
        if (channel && channel.avgViewsLast5 > 0) {
          video.outlierFactor = video.views / channel.avgViewsLast5;
          await video.save();
        }
      }
      
      console.log(`Updated outlier factors for ${videos.length} videos`);
    } catch (error) {
      console.error('Error calculating outlier factors:', error);
    }
  }

  // Process and save video data
  async processVideoData(videoData) {
    const results = {
      processed: 0,
      errors: 0,
      shorts: 0,
      longForm: 0
    };

    for (const videoInfo of videoData) {
      try {
        // Check if video already exists
        let video = await Video.findOne({ videoId: videoInfo.videoId });
        
        if (video) {
          // Update existing video
          Object.assign(video, videoInfo);
          video.dataFetchedAt = new Date();
        } else {
          // Create new video
          video = new Video(videoInfo);
        }

        await video.save();

        // Update channel information
        await this.updateChannelInfo(videoInfo.channelId);

        results.processed++;
        
        if (video.isShort) {
          results.shorts++;
        } else {
          results.longForm++;
        }

      } catch (error) {
        console.error(`Error processing video ${videoInfo.videoId}:`, error);
        results.errors++;
      }
    }

    return results;
  }

  // Update channel information
  async updateChannelInfo(channelId) {
    try {
      let channel = await Channel.findOne({ channelId });

      if (!channel) {
        try {
          const channelData = await youtubeService.getChannelDetails(channelId);
          channel = new Channel(channelData);
        } catch (error) {
          console.error(`Error fetching new channel ${channelId}:`, error);
          return null;
        }
      } else {
        try {
          const channelData = await youtubeService.getChannelDetails(channelId);
          Object.assign(channel, channelData);
          channel.lastUpdated = new Date();
        } catch (error) {
          console.error(`Error updating channel ${channelId}:`, error);
          // Continue with existing channel data
        }
      }

      await channel.save();
      await channel.updateAverageViews();

      return channel;
    } catch (error) {
      console.error(`Error updating channel ${channelId}:`, error);
      return null;
    }
  }

  // Fetch and process trending videos
  async fetchTrendingVideos(maxResults = 50) {
    try {
      console.log('Fetching trending videos...');
      
      const videoData = await youtubeService.getTrendingVideos(maxResults);
      const results = await this.processVideoData(videoData);
      
      console.log(`Trending fetch complete:`, results);
      
      return results;
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      throw error;
    }
  }

  // Update video statistics
  async updateVideoStats() {
    try {
      console.log('Updating video statistics...');
      
      const recentVideos = await Video.find({
        uploadTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      const videoIds = recentVideos.map(v => v.videoId);
      
      if (videoIds.length === 0) {
        console.log('No recent videos to update');
        return;
      }

      // Process in batches of 50 (YouTube API limit)
      const batchSize = 50;
      let updated = 0;

      for (let i = 0; i < videoIds.length; i += batchSize) {
        const batch = videoIds.slice(i, i + batchSize);
        const videoData = await youtubeService.getVideoDetails(batch);
        
        for (const videoInfo of videoData) {
          const video = await Video.findOne({ videoId: videoInfo.videoId });
          if (video) {
            video.views = videoInfo.views;
            video.likes = videoInfo.likes;
            video.comments = videoInfo.comments;
            video.viewsPerHour = videoInfo.viewsPerHour;
            video.dataFetchedAt = new Date();
            await video.save();
            updated++;
          }
        }
      }

      console.log(`Updated ${updated} videos`);
      
      // Recalculate outlier factors
      await this.calculateOutlierFactors();
      
    } catch (error) {
      console.error('Error updating video stats:', error);
    }
  }

  // Get trending videos with filters
  async getTrendingVideos(filters = {}) {
    const query = { trending: true };
    
    if (filters.isShort !== undefined) {
      query.isShort = filters.isShort;
    }
    
    if (filters.minViews) {
      query.views = { $gte: filters.minViews };
    }

    return await Video.find(query)
      .sort({ viewsPerHour: -1 })
      .limit(filters.limit || 50);
  }

  // Get outlier videos
  async getOutlierVideos(limit = 50) {
    return await Video.find({ outlierFactor: { $gt: 1 } })
      .sort({ outlierFactor: -1 })
      .limit(limit);
  }
}

module.exports = new DataProcessor();