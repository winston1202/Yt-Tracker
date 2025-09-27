const express = require('express');
const alertService = require('../services/alertService');

const router = express.Router();

// GET /alerts/settings - Get alert settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await alertService.getAlertSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching alert settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert settings'
    });
  }
});

// PUT /alerts/settings - Update alert settings
router.put('/settings', async (req, res) => {
  try {
    const updates = req.body;
    const settings = await alertService.updateAlertSettings(updates);
    
    res.json({
      success: true,
      data: settings,
      message: 'Alert settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating alert settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update alert settings'
    });
  }
});

// POST /alerts/test - Test alert system
router.post('/test', async (req, res) => {
  try {
    const { type } = req.body; // 'discord' or 'email'
    const settings = await alertService.getAlertSettings();
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        error: 'No alert settings found'
      });
    }

    // Create a test video for the alert
    const testVideo = {
      videoId: 'test123',
      title: 'Test Viral Video Alert - This is a Test',
      views: 1000000,
      likes: 50000,
      comments: 5000,
      viewsPerHour: 25000,
      outlierFactor: 15.5,
      isShort: true,
      category: 'Entertainment'
    };

    if (type === 'discord' && settings.discordWebhook.enabled) {
      await alertService.sendDiscordAlert([testVideo], settings);
    } else if (type === 'email' && settings.emailAlerts.enabled) {
      await alertService.sendEmailAlert([testVideo], settings);
    } else {
      return res.status(400).json({
        success: false,
        error: `${type} alerts are not enabled or configured`
      });
    }

    res.json({
      success: true,
      message: `Test ${type} alert sent successfully`
    });
  } catch (error) {
    console.error('Error sending test alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test alert'
    });
  }
});

// POST /alerts/check - Manually trigger alert check
router.post('/check', async (req, res) => {
  try {
    await alertService.checkViralAlerts();
    
    res.json({
      success: true,
      message: 'Alert check completed successfully'
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check alerts'
    });
  }
});

module.exports = router;