const express = require('express');
const router = express.Router();

// GET /admin/status - Get system status
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        scheduledJobs: {
          mainFetch: { running: false, scheduled: false },
          viralAlerts: { running: false, scheduled: false },
          cleanup: { running: false, scheduled: false }
        },
        youtubeApiRequests: 0,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system status'
    });
  }
});

// POST /admin/fetch/manual - Trigger manual fetch
router.post('/fetch/manual', async (req, res) => {
  try {
    // Mock successful fetch
    const results = {
      processed: 10,
      errors: 0,
      shorts: 6,
      longForm: 4
    };
    
    res.json({
      success: true,
      data: results,
      message: 'Manual fetch completed successfully'
    });
  } catch (error) {
    console.error('Manual fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Manual fetch failed'
    });
  }
});

module.exports = router;