const express = require('express');
const analyticsService = require('../services/analyticsService');
const Video = require('../models/Video');

const router = express.Router();

// GET /analytics/trends - Get trending niches
router.get('/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const trends = await analyticsService.getTrendingNiches(parseInt(days));
    
    res.json({
      success: true,
      data: trends || [],
      period: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      data: [],
      error: 'Failed to fetch trending niches'
    });
  }
});

// GET /analytics/historical - Get historical analytics
router.get('/historical', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await analyticsService.getHistoricalAnalytics(parseInt(days));
    
    res.json({
      success: true,
      data: analytics,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching historical analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical analytics'
    });
  }
});

// GET /analytics/velocity/:videoId - Get velocity curve for a video
router.get('/velocity/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { hours = 24 } = req.query;
    
    const velocityCurve = await analyticsService.getVelocityCurve(videoId, parseInt(hours));
    
    res.json({
      success: true,
      data: velocityCurve,
      videoId,
      period: `${hours} hours`
    });
  } catch (error) {
    console.error('Error fetching velocity curve:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch velocity curve'
    });
  }
});

// GET /analytics/insights - Get performance insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await analyticsService.getPerformanceInsights();
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance insights'
    });
  }
});

// GET /analytics/engagement - Get engagement metrics
router.get('/engagement', async (req, res) => {
  try {
    const { limit = 50, sortBy = 'engagement' } = req.query;
    
    const videos = await Video.find({})
      .sort({ dataFetchedAt: -1 })
      .limit(parseInt(limit));

    const engagementData = videos.map(video => {
      const engagementRate = analyticsService.calculateEngagementRate(video);
      return {
        videoId: video.videoId,
        title: video.title,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        engagementRate: Math.round(engagementRate * 100) / 100,
        isShort: video.isShort,
        outlierFactor: video.outlierFactor,
        uploadTime: video.uploadTime
      };
    });

    // Sort by engagement rate if requested
    if (sortBy === 'engagement') {
      engagementData.sort((a, b) => b.engagementRate - a.engagementRate);
    }

    res.json({
      success: true,
      data: engagementData,
      count: engagementData.length
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch engagement metrics'
    });
  }
});

// POST /analytics/store-snapshot - Store analytics snapshot
router.post('/store-snapshot', async (req, res) => {
  try {
    const analytics = await analyticsService.storeDailyAnalytics();
    
    res.json({
      success: true,
      data: analytics,
      message: 'Analytics snapshot stored successfully'
    });
  } catch (error) {
    console.error('Error storing analytics snapshot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store analytics snapshot'
    });
  }
});

module.exports = router;