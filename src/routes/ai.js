const express = require('express');
const aiService = require('../services/aiService');
const Video = require('../models/Video');

const router = express.Router();

// POST /ai/suggestions - Generate AI suggestions for a video
router.post('/suggestions', async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required'
      });
    }

    const video = await Video.findOne({ videoId });
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    let suggestions;
    try {
      suggestions = await aiService.generateAllSuggestions(video);
    } catch (error) {
      console.error('AI service error:', error);
      // Return fallback suggestions
      suggestions = {
        titles: [
          `${video.isShort ? 'This' : 'The'} ${video.category} Secret That Got ${formatViews(video.views)} Views`,
          `Why This ${video.category} Video Went Viral (${video.outlierFactor.toFixed(1)}x Growth!)`,
          `${video.isShort ? 'Quick' : 'Ultimate'} ${video.category} Hack Everyone's Talking About`
        ],
        thumbnails: [
          `Split-screen before/after with shocked expression and "${video.outlierFactor.toFixed(1)}x" text overlay`,
          `Close-up reaction face with bright arrows pointing to key visual element`,
          `Bold text "${formatViews(video.views)} VIEWS!" with contrasting background colors`
        ],
        twists: [
          `Apply this ${video.category} concept to a different age demographic`,
          `Create a "behind the scenes" or "reaction" version of this content`,
          `Combine this trend with another popular ${video.isShort ? 'Short' : 'long-form'} format`
        ],
        generated: new Date().toISOString()
      };
    }
    
    res.json({
      success: true,
      data: suggestions,
      video: {
        id: video.videoId,
        title: video.title,
        category: video.category,
        outlierFactor: video.outlierFactor
      }
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI suggestions'
    });
  }
});

function formatViews(views) {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
}

// POST /ai/titles - Generate title suggestions only
router.post('/titles', async (req, res) => {
  try {
    const { videoId } = req.body;
    
    const video = await Video.findOne({ videoId });
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const titles = await aiService.generateTitleSuggestions(video);
    
    res.json({
      success: true,
      data: titles
    });
  } catch (error) {
    console.error('Error generating title suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate title suggestions'
    });
  }
});

// POST /ai/thumbnails - Generate thumbnail suggestions only
router.post('/thumbnails', async (req, res) => {
  try {
    const { videoId } = req.body;
    
    const video = await Video.findOne({ videoId });
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const thumbnails = await aiService.generateThumbnailSuggestions(video);
    
    res.json({
      success: true,
      data: thumbnails
    });
  } catch (error) {
    console.error('Error generating thumbnail suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate thumbnail suggestions'
    });
  }
});

// POST /ai/twists - Generate niche twist suggestions only
router.post('/twists', async (req, res) => {
  try {
    const { videoId } = req.body;
    
    const video = await Video.findOne({ videoId });
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const twists = await aiService.generateNicheTwists(video);
    
    res.json({
      success: true,
      data: twists
    });
  } catch (error) {
    console.error('Error generating niche twist suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate niche twist suggestions'
    });
  }
});

module.exports = router;