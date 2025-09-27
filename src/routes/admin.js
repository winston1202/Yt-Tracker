const express = require('express');
const scheduler = require('../services/scheduler');
const youtubeService = require('../services/youtubeService');
const dataProcessor = require('../services/dataProcessor');

const router = express.Router();

// GET /admin/status - Get system status
router.get('/status', (req, res) => {
  try {
    const jobStatus = scheduler.getJobStatus();
    const apiRequestCount = youtubeService.getRequestCount();

    res.json({
      success: true,
      data: {
        scheduledJobs: jobStatus,
        youtubeApiRequests: apiRequestCount,
        environment: process.env.NODE_ENV,
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
    const results = await scheduler.triggerManualFetch();
    
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

// POST /admin/jobs/start - Start all scheduled jobs
router.post('/jobs/start', (req, res) => {
  try {
    scheduler.startAll();
    
    res.json({
      success: true,
      message: 'All scheduled jobs started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start jobs'
    });
  }
});

// POST /admin/jobs/stop - Stop all scheduled jobs
router.post('/jobs/stop', (req, res) => {
  try {
    scheduler.stopAll();
    
    res.json({
      success: true,
      message: 'All scheduled jobs stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to stop jobs'
    });
  }
});

// POST /admin/outliers/calculate - Manually recalculate outlier factors
router.post('/outliers/calculate', async (req, res) => {
  try {
    await dataProcessor.calculateOutlierFactors();
    
    res.json({
      success: true,
      message: 'Outlier factors recalculated successfully'
    });
  } catch (error) {
    console.error('Error calculating outliers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate outlier factors'
    });
  }
});

module.exports = router;