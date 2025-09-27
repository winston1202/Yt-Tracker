const nodemailer = require('nodemailer');
const axios = require('axios');
const AlertSettings = require('../models/AlertSettings');
const Video = require('../models/Video');

class AlertService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  initializeEmailTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        this.emailTransporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } catch (error) {
        console.error('Error initializing email transporter:', error);
        this.emailTransporter = null;
      }
    }
  }

  // Check for viral videos and send alerts
  async checkViralAlerts() {
    try {
      const settings = await AlertSettings.findOne({ userId: 'default' });
      if (!settings) return;

      // Find videos that crossed the threshold in the last 15 minutes
      const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);
      
      const viralVideos = await Video.find({
        outlierFactor: { $gte: settings.outlierThreshold },
        dataFetchedAt: { $gte: cutoffTime },
        views: { $gte: settings.minViews }
      }).sort({ outlierFactor: -1 }).limit(10);

      if (viralVideos.length === 0) return;

      // Send Discord alerts
      if (settings.discordWebhook.enabled && settings.discordWebhook.url) {
        await this.sendDiscordAlert(viralVideos, settings);
      }

      // Send email alerts (based on frequency)
      if (settings.emailAlerts.enabled && settings.emailAlerts.email) {
        await this.sendEmailAlert(viralVideos, settings);
      }

      console.log(`Sent alerts for ${viralVideos.length} viral videos`);
    } catch (error) {
      console.error('Error checking viral alerts:', error);
    }
  }

  // Send Discord webhook alert
  async sendDiscordAlert(videos, settings) {
    try {
      const embeds = videos.slice(0, 5).map(video => ({
        title: `🔥 VIRAL ALERT: ${video.outlierFactor.toFixed(1)}x Outlier!`,
        description: video.title.substring(0, 200) + (video.title.length > 200 ? '...' : ''),
        color: this.getAlertColor(video.outlierFactor),
        fields: [
          {
            name: 'Views',
            value: this.formatNumber(video.views),
            inline: true
          },
          {
            name: 'Views/Hour',
            value: this.formatNumber(video.viewsPerHour),
            inline: true
          },
          {
            name: 'Type',
            value: video.isShort ? '🎬 Short' : '📹 Long-form',
            inline: true
          }
        ],
        url: `https://youtube.com/watch?v=${video.videoId}`,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Viral Niche Finder'
        }
      }));

      const payload = {
        username: 'Viral Niche Finder',
        avatar_url: 'https://img.icons8.com/color/96/000000/youtube-play.png',
        content: `🚨 **${videos.length} NEW VIRAL VIDEO${videos.length > 1 ? 'S' : ''} DETECTED!**`,
        embeds
      };

      await axios.post(settings.discordWebhook.url, payload);
    } catch (error) {
      console.error('Error sending Discord alert:', error);
    }
  }

  // Send email alert
  async sendEmailAlert(videos, settings) {
    try {
      if (!this.emailTransporter) return;

      const html = this.generateEmailHTML(videos);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: settings.emailAlerts.email,
        subject: `🔥 ${videos.length} Viral Video${videos.length > 1 ? 's' : ''} Detected!`,
        html
      };

      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  // Generate HTML email template
  generateEmailHTML(videos) {
    const videoRows = videos.map(video => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">
          <strong>${video.title.substring(0, 60)}${video.title.length > 60 ? '...' : ''}</strong><br>
          <small style="color: #666;">${video.isShort ? '🎬 Short' : '📹 Long-form'}</small>
        </td>
        <td style="padding: 12px; text-align: center;">
          <span style="background: ${this.getAlertColorHex(video.outlierFactor)}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
            ${video.outlierFactor.toFixed(1)}x
          </span>
        </td>
        <td style="padding: 12px; text-align: right;">
          ${this.formatNumber(video.views)}<br>
          <small style="color: #666;">${this.formatNumber(video.viewsPerHour)}/hr</small>
        </td>
        <td style="padding: 12px; text-align: center;">
          <a href="https://youtube.com/watch?v=${video.videoId}" style="background: #ff0000; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">
            Watch
          </a>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Viral Video Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff0000, #cc0000); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🔥 Viral Video Alert!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New viral content detected in your tracked niches</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Video</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Outlier Factor</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Views</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${videoRows}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This alert was generated by Viral Niche Finder<br>
            <a href="http://localhost:3000" style="color: #ff0000;">View Dashboard</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // Get alert color based on outlier factor
  getAlertColor(factor) {
    if (factor >= 50) return 0xFF0000; // Red
    if (factor >= 25) return 0xFF4500; // Orange Red
    if (factor >= 10) return 0xFF8C00; // Dark Orange
    return 0xFFA500; // Orange
  }

  getAlertColorHex(factor) {
    if (factor >= 50) return '#ff0000';
    if (factor >= 25) return '#ff4500';
    if (factor >= 10) return '#ff8c00';
    return '#ffa500';
  }

  // Format numbers for display
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  // Get or create alert settings
  async getAlertSettings() {
    try {
      let settings = await AlertSettings.findOne({ userId: 'default' });
      if (!settings) {
        settings = new AlertSettings({ userId: 'default' });
        await settings.save();
      }
      return settings;
    } catch (error) {
      console.error('Error getting alert settings:', error);
      return null;
    }
  }

  // Update alert settings
  async updateAlertSettings(updates) {
    try {
      const settings = await AlertSettings.findOneAndUpdate(
        { userId: 'default' },
        updates,
        { new: true, upsert: true }
      );
      return settings;
    } catch (error) {
      console.error('Error updating alert settings:', error);
      return null;
    }
  }
}

module.exports = new AlertService();