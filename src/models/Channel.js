const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  channelName: {
    type: String,
    required: true
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  uploadCount: {
    type: Number,
    default: 0
  },
  channelAge: {
    type: Date,
    required: true
  },
  avgViewsLast5: {
    type: Number,
    default: 0
  },
  customUrl: String,
  description: String,
  country: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update avgViewsLast5 method
channelSchema.methods.updateAverageViews = async function() {
  const Video = mongoose.model('Video');
  const recentVideos = await Video.find({
    channelId: this.channelId
  })
  .sort({ uploadTime: -1 })
  .limit(5);

  if (recentVideos.length > 0) {
    const totalViews = recentVideos.reduce((sum, video) => sum + video.views, 0);
    this.avgViewsLast5 = Math.round(totalViews / recentVideos.length);
  }

  return this.save();
};

module.exports = mongoose.model('Channel', channelSchema);