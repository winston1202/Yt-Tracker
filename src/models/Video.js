const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  channelId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    default: 'Unknown'
  },
  lengthSeconds: {
    type: Number,
    required: true
  },
  isShort: {
    type: Boolean,
    required: true,
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  viewsPerHour: {
    type: Number,
    default: 0
  },
  uploadTime: {
    type: Date,
    required: true
  },
  dataFetchedAt: {
    type: Date,
    default: Date.now
  },
  outlierFactor: {
    type: Number,
    default: 0
  },
  trending: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
videoSchema.index({ outlierFactor: -1 });
videoSchema.index({ viewsPerHour: -1 });
videoSchema.index({ uploadTime: -1 });
videoSchema.index({ trending: 1, isShort: 1 });

module.exports = mongoose.model('Video', videoSchema);