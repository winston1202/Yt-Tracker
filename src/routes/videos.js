const express = require('express');
const Video = require('../models/Video');
const dataProcessor = require('../services/dataProcessor');

const router = express.Router();

// GET /videos/trending - Returns trending videos
router.get('/trending', async (req, res) => {
  try {
    const { isShort, minViews, limit } = req.query;
    
    const filters = {
      isShort: isShort !== undefined ? isShort === 'true' : undefined,
      minViews: minViews ? parseInt(minViews) : undefined,
      limit: limit ? parseInt(limit) : 50
    };

    const videos = await dataProcessor.getTrendingVideos(filters);
    
    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending videos'
    });
  }
});

// GET /videos/outliers - Returns videos with highest outlier factors
router.get('/outliers', async (req, res) => {
  try {
    const { limit } = req.query;
    const videos = await dataProcessor.getOutlierVideos(
      limit ? parseInt(limit) : 50
    );
    
    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching outlier videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch outlier videos'
    });
  }
});

// GET /videos/shorts - Returns only YouTube Shorts
router.get('/shorts', async (req, res) => {
  try {
    const { limit, minViews } = req.query;
    
    const query = { isShort: true };
    if (minViews) query.views = { $gte: parseInt(minViews) };
    
    const videos = await Video.find(query)
      .sort({ viewsPerHour: -1 })
      .limit(limit ? parseInt(limit) : 50);
    
    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching shorts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shorts'
    });
  }
});

// GET /videos/longform - Returns only long-form videos
router.get('/longform', async (req, res) => {
  try {
    const { limit, minViews } = req.query;
    
    const query = { isShort: false };
    if (minViews) query.views = { $gte: parseInt(minViews) };
    
    const videos = await Video.find(query)
      .sort({ viewsPerHour: -1 })
      .limit(limit ? parseInt(limit) : 50);
    
    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching long-form videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch long-form videos'
    });
  }
});

// GET /videos/:id - Get specific video details
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findOne({ videoId: req.params.id });
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }
    
    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video'
    });
  }
});

// GET /videos/stats/summary - Get overall statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const totalShorts = await Video.countDocuments({ isShort: true });
    const totalLongForm = await Video.countDocuments({ isShort: false });
    const trendingVideos = await Video.countDocuments({ trending: true });
    
    // Get top performing videos
    const topOutliers = await Video.find({ 
      outlierFactor: { $gt: 1 },
      views: { $gt: 0 }
    })
      .sort({ outlierFactor: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalVideos,
        totalShorts,
        totalLongForm,
        trendingVideos,
        topOutliers,
        percentageShorts: totalVideos > 0 ? (totalShorts / totalVideos * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching video statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;