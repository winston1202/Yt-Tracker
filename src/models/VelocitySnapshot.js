const mongoose = require('mongoose');

const velocitySnapshotSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  views: {
    type: Number,
    required: true
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
    required: true
  },
  engagementRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
velocitySnapshotSchema.index({ videoId: 1, timestamp: -1 });

module.exports = mongoose.model('VelocitySnapshot', velocitySnapshotSchema);