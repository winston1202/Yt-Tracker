const express = require('express');
const Channel = require('../models/Channel');
const Video = require('../models/Video');
const youtubeService = require('../services/youtubeService');

const router = express.Router();

// GET /channels/:id - Returns channel details
router.get('/:id', async (req, res) => {
  try {
    let channel = await Channel.findOne({ channelId: req.params.id });
    
    if (!channel) {
      // Try to fetch from YouTube API
      try {
        const channelData = await youtubeService.getChannelDetails(req.params.id);
        if (!channelData) {
          return res.status(404).json({
            success: false,
            error: 'Channel not found'
          });
        }
        channel = new Channel(channelData);
        await channel.save();
        await channel.updateAverageViews();
      } catch (error) {
        console.error('Error fetching channel from YouTube:', error);
        return res.status(404).json({
          success: false,
          error: 'Channel not found'
        });
      }
    }

    // Get channel's recent videos
    const recentVideos = await Video.find({ channelId: req.params.id })
      .sort({ uploadTime: -1 })
      .limit(10);

    // Calculate additional metrics
    const totalVideosTracked = await Video.countDocuments({ channelId: req.params.id });
    const shortsCount = await Video.countDocuments({ channelId: req.params.id, isShort: true });
    const longFormCount = totalVideosTracked - shortsCount;

    res.json({
      success: true,
      data: {
        ...channel.toObject(),
        recentVideos,
        totalVideosTracked,
        shortsCount,
        longFormCount
      }
    });
  } catch (error) {
    console.error('Error fetching channel details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channel details'
    });
  }
});

// GET /channels/:id/videos - Get all videos from a channel
router.get('/:id/videos', async (req, res) => {
  try {
    const { isShort, limit, sortBy } = req.query;
    
    const query = { channelId: req.params.id };
    if (isShort !== undefined) {
      query.isShort = isShort === 'true';
    }

    let sortOption = { uploadTime: -1 };
    if (sortBy === 'views') sortOption = { views: -1 };
    if (sortBy === 'outlier') sortOption = { outlierFactor: -1 };
    if (sortBy === 'viewsPerHour') sortOption = { viewsPerHour: -1 };

    const videos = await Video.find(query)
      .sort(sortOption)
      .limit(limit ? parseInt(limit) : 50);

    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channel videos'
    });
  }
});

// GET /channels - Get all tracked channels
router.get('/', async (req, res) => {
  try {
    const { limit, sortBy } = req.query;
    
    let sortOption = { subscriberCount: -1 };
    if (sortBy === 'avgViews') sortOption = { avgViewsLast5: -1 };
    if (sortBy === 'totalViews') sortOption = { totalViews: -1 };

    const channels = await Channel.find({})
      .sort(sortOption)
      .limit(limit ? parseInt(limit) : 50);

    res.json({
      success: true,
      count: channels.length,
      data: channels
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channels'
    });
  }
});

// POST /channels/:id/refresh - Manually refresh channel data
router.post('/:id/refresh', async (req, res) => {
  try {
    const channel = await Channel.findOne({ channelId: req.params.id });
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }

    // Fetch updated data from YouTube API
    const channelData = await youtubeService.getChannelDetails(req.params.id);
    Object.assign(channel, channelData);
    channel.lastUpdated = new Date();
    
    await channel.save();
    await channel.updateAverageViews();

    res.json({
      success: true,
      data: channel,
      message: 'Channel data refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing channel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh channel data'
    });
  }
});

module.exports = router;