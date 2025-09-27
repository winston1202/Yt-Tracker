const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  totalVideos: {
    type: Number,
    default: 0
  },
  totalShorts: {
    type: Number,
    default: 0
  },
  totalLongForm: {
    type: Number,
    default: 0
  },
  avgEngagementRate: {
    type: Number,
    default: 0
  },
  topNiches: [{
    category: String,
    count: Number,
    avgViews: Number,
    heatScore: Number
  }],
  outlierCount: {
    type: Number,
    default: 0
  },
  viralThreshold: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Index for efficient querying
analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);