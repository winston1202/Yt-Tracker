const Video = require('../models/Video');
const Channel = require('../models/Channel');
const Analytics = require('../models/Analytics');
const VelocitySnapshot = require('../models/VelocitySnapshot');

class AnalyticsService {
  
  // Calculate engagement rate for a video
  calculateEngagementRate(video) {
    if (video.views === 0) return 0;
    return ((video.likes + video.comments) / video.views) * 100;
  }

  // Store velocity snapshot for trending videos
  async storeVelocitySnapshot(video) {
    try {
      if (!video || !video.videoId) {
        console.error('Invalid video data for velocity snapshot');
        return null;
      }
      
      const engagementRate = this.calculateEngagementRate(video);
      
      const snapshot = new VelocitySnapshot({
        videoId: video.videoId,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        viewsPerHour: video.viewsPerHour,
        engagementRate
      });

      await snapshot.save();
      return snapshot;
    } catch (error) {
      console.error('Error storing velocity snapshot:', error);
      return null;
    }
  }

  // Get velocity curve for a video
  async getVelocityCurve(videoId, hours = 24) {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const snapshots = await VelocitySnapshot.find({
        videoId,
        timestamp: { $gte: cutoffTime }
      }).sort({ timestamp: 1 });

      return snapshots.map(snapshot => ({
        timestamp: snapshot.timestamp,
        views: snapshot.views,
        viewsPerHour: snapshot.viewsPerHour,
        engagementRate: snapshot.engagementRate
      }));
    } catch (error) {
      console.error('Error getting velocity curve:', error);
      return [];
    }
  }

  // Calculate retention proxy based on engagement patterns
  async calculateRetentionProxy(video) {
    try {
      // Get average engagement for similar videos in the same category
      const similarVideos = await Video.find({
        category: video.category,
        isShort: video.isShort,
        views: { 
          $gte: video.views * 0.5, 
          $lte: video.views * 2 
        }
      }).limit(50);

      if (similarVideos.length === 0) return 1;

      const avgEngagement = similarVideos.reduce((sum, v) => {
        return sum + this.calculateEngagementRate(v);
      }, 0) / similarVideos.length;

      const videoEngagement = this.calculateEngagementRate(video);
      
      // Return ratio compared to average (higher = better retention proxy)
      return avgEngagement > 0 ? videoEngagement / avgEngagement : 1;
    } catch (error) {
      console.error('Error calculating retention proxy:', error);
      return 1;
    }
  }

  // Get trending niches over time
  async getTrendingNiches(days = 7) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const pipeline = [
        {
          $match: {
            uploadTime: { $gte: cutoffDate },
            trending: true
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgViews: { $avg: '$views' },
            avgOutlier: { $avg: '$outlierFactor' },
            totalViews: { $sum: '$views' }
          }
        },
        {
          $addFields: {
            heatScore: {
              $multiply: [
                { $divide: ['$avgOutlier', 2] },
                { $divide: ['$avgViews', 10000] }
              ]
            }
          }
        },
        {
          $sort: { heatScore: -1 }
        },
        {
          $limit: 20
        }
      ];

      const niches = await Video.aggregate(pipeline);
      
      return niches.map(niche => ({
        category: niche._id,
        count: niche.count,
        avgViews: Math.round(niche.avgViews),
        avgOutlier: Math.round(niche.avgOutlier * 10) / 10,
        heatScore: Math.round(niche.heatScore * 10) / 10,
        totalViews: niche.totalViews
      }));
    } catch (error) {
      console.error('Error getting trending niches:', error);
      return [];
    }
  }

  // Store daily analytics snapshot
  async storeDailyAnalytics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if analytics for today already exist
      const existing = await Analytics.findOne({ date: today });
      if (existing) return existing;

      const totalVideos = await Video.countDocuments();
      const totalShorts = await Video.countDocuments({ isShort: true });
      const totalLongForm = totalVideos - totalShorts;
      const outlierCount = await Video.countDocuments({ outlierFactor: { $gt: 10 } });

      // Calculate average engagement rate
      const videos = await Video.find({}).limit(1000);
      const avgEngagementRate = videos.reduce((sum, video) => {
        return sum + this.calculateEngagementRate(video);
      }, 0) / videos.length;

      // Get top niches
      const topNiches = await this.getTrendingNiches(1);

      const analytics = new Analytics({
        date: today,
        totalVideos,
        totalShorts,
        totalLongForm,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        topNiches: topNiches.slice(0, 10),
        outlierCount
      });

      await analytics.save();
      return analytics;
    } catch (error) {
      console.error('Error storing daily analytics:', error);
    }
  }

  // Get historical analytics
  async getHistoricalAnalytics(days = 30) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const analytics = await Analytics.find({
        date: { $gte: cutoffDate }
      }).sort({ date: 1 });

      return analytics;
    } catch (error) {
      console.error('Error getting historical analytics:', error);
      return [];
    }
  }

  // Get performance insights
  async getPerformanceInsights() {
    try {
      const [
        totalVideos,
        viralVideos,
        topPerformers,
        categoryBreakdown
      ] = await Promise.all([
        Video.countDocuments(),
        Video.countDocuments({ outlierFactor: { $gt: 5 } }),
        Video.find({ outlierFactor: { $gt: 2 } })
          .sort({ outlierFactor: -1 })
          .limit(10),
        Video.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgOutlier: { $avg: '$outlierFactor' }
            }
          },
          { $sort: { avgOutlier: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        totalVideos,
        viralVideos,
        viralRate: totalVideos > 0 ? (viralVideos / totalVideos * 100).toFixed(1) : 0,
        topPerformers,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error getting performance insights:', error);
      return null;
    }
  }
}

module.exports = new AnalyticsService();