const express = require('express');
const router = express.Router();

// Mock channel data
const mockChannels = {
  'channel1': {
    channelId: 'channel1',
    channelName: 'Viral Shorts Creator',
    subscriberCount: 250000,
    totalViews: 15000000,
    uploadCount: 150,
    channelAge: new Date('2020-01-15').toISOString(),
    avgViewsLast5: 95000,
    description: 'Creating viral short-form content',
    lastUpdated: new Date().toISOString()
  },
  'channel2': {
    channelId: 'channel2',
    channelName: 'Educational Content Pro',
    subscriberCount: 180000,
    totalViews: 8500000,
    uploadCount: 85,
    channelAge: new Date('2019-06-20').toISOString(),
    avgViewsLast5: 105000,
    description: 'High-quality educational tutorials',
    lastUpdated: new Date().toISOString()
  }
};

// GET /channels/:id - Returns channel details
router.get('/:id', async (req, res) => {
  try {
    const channel = mockChannels[req.params.id];
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }

    // Add some mock recent videos
    const recentVideos = [
      {
        videoId: 'recent1',
        title: 'Latest viral video from this channel',
        views: 125000,
        uploadTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isShort: channel.channelId === 'channel1'
      }
    ];

    res.json({
      success: true,
      data: {
        ...channel,
        recentVideos,
        totalVideosTracked: 10,
        shortsCount: channel.channelId === 'channel1' ? 8 : 2,
        longFormCount: channel.channelId === 'channel1' ? 2 : 8
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

module.exports = router;