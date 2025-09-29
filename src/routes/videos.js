const express = require('express');
const router = express.Router();

// Mock data for testing
const mockVideos = [
  {
    videoId: 'test1',
    title: 'Amazing YouTube Short Goes Viral!',
    channelId: 'channel1',
    views: 1500000,
    likes: 75000,
    comments: 5000,
    viewsPerHour: 25000,
    isShort: true,
    outlierFactor: 15.5,
    trending: true,
    uploadTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lengthSeconds: 45,
    category: 'Entertainment'
  },
  {
    videoId: 'test2',
    title: 'Long Form Tutorial That Exploded',
    channelId: 'channel2',
    views: 850000,
    likes: 42000,
    comments: 3200,
    viewsPerHour: 12000,
    isShort: false,
    outlierFactor: 8.2,
    trending: true,
    uploadTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    lengthSeconds: 720,
    category: 'Education'
  }
];

// GET /videos/trending - Returns trending videos
router.get('/trending', async (req, res) => {
  try {
    const { isShort, minViews, limit } = req.query;
    
    let filteredVideos = [...mockVideos];
    
    if (isShort !== undefined) {
      filteredVideos = filteredVideos.filter(v => v.isShort === (isShort === 'true'));
    }
    
    if (minViews) {
      filteredVideos = filteredVideos.filter(v => v.views >= parseInt(minViews));
    }
    
    if (limit) {
      filteredVideos = filteredVideos.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: filteredVideos.length,
      data: filteredVideos
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
    
    let outliers = mockVideos
      .filter(v => v.outlierFactor > 1)
      .sort((a, b) => b.outlierFactor - a.outlierFactor);
    
    if (limit) {
      outliers = outliers.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: outliers.length,
      data: outliers
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
    
    let shorts = mockVideos.filter(v => v.isShort);
    
    if (minViews) {
      shorts = shorts.filter(v => v.views >= parseInt(minViews));
    }
    
    if (limit) {
      shorts = shorts.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: shorts.length,
      data: shorts
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
    
    let longform = mockVideos.filter(v => !v.isShort);
    
    if (minViews) {
      longform = longform.filter(v => v.views >= parseInt(minViews));
    }
    
    if (limit) {
      longform = longform.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      count: longform.length,
      data: longform
    });
  } catch (error) {
    console.error('Error fetching long-form videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch long-form videos'
    });
  }
});

// GET /videos/stats/summary - Get overall statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalVideos = mockVideos.length;
    const totalShorts = mockVideos.filter(v => v.isShort).length;
    const totalLongForm = totalVideos - totalShorts;
    const trendingVideos = mockVideos.filter(v => v.trending).length;
    
    const topOutliers = mockVideos
      .filter(v => v.outlierFactor > 1)
      .sort((a, b) => b.outlierFactor - a.outlierFactor)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        totalVideos,
        totalShorts,
        totalLongForm,
        trendingVideos,
        topOutliers,
        percentageShorts: totalVideos > 0 ? ((totalShorts / totalVideos) * 100).toFixed(1) : '0'
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