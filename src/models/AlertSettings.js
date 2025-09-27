const mongoose = require('mongoose');

const alertSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default',
    unique: true
  },
  outlierThreshold: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  discordWebhook: {
    enabled: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    }
  },
  emailAlerts: {
    enabled: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      default: ''
    },
    frequency: {
      type: String,
      enum: ['immediate', '6hours', '12hours', 'daily'],
      default: '12hours'
    }
  },
  categories: [{
    type: String
  }],
  minViews: {
    type: Number,
    default: 1000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AlertSettings', alertSettingsSchema);