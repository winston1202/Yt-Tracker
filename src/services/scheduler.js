const cron = require('node-cron');
const dataProcessor = require('./dataProcessor');
const youtubeService = require('./youtubeService');
const analyticsService = require('./analyticsService');
const alertService = require('./alertService');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  // Main data fetching job - runs every 15 minutes
  startMainFetchJob() {
    const job = cron.schedule('*/15 * * * *', async () => {
      console.log(`[${new Date().toISOString()}] Starting scheduled data fetch...`);
      
      try {
        // Fetch trending videos
        const results = await dataProcessor.fetchTrendingVideos(25);
        console.log(`Fetched ${results.processed} videos`);
        
        // Update existing video stats
        await dataProcessor.updateVideoStats();
        
        // Store velocity snapshots for trending videos (limit to prevent overload)
        try {
          const trendingVideos = await dataProcessor.getTrendingVideos({ limit: 10 });
          for (const video of trendingVideos) {
            await analyticsService.storeVelocitySnapshot(video);
          }
        } catch (error) {
          console.error('Error storing velocity snapshots:', error);
        }
        
        console.log(`[${new Date().toISOString()}] Scheduled fetch completed successfully`);
        console.log(`YouTube API requests used: ${youtubeService.getRequestCount()}`);
        
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Scheduled fetch failed:`, error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('mainFetch', job);
    job.start();
    
    console.log('Main fetch job scheduled (every 15 minutes)');
  }

  // Viral alert job - runs every 15 minutes
  startViralAlertJob() {
    const job = cron.schedule('*/15 * * * *', async () => {
      console.log(`[${new Date().toISOString()}] Checking for viral alerts...`);
      
      try {
        await alertService.checkViralAlerts();
        console.log(`[${new Date().toISOString()}] Viral alert check completed`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Viral alert check failed:`, error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('viralAlerts', job);
    job.start();
    
    console.log('Viral alert job scheduled (every 15 minutes)');
  }

  // Daily cleanup job - runs at midnight
  startCleanupJob() {
    const job = cron.schedule('0 0 * * *', async () => {
      console.log(`[${new Date().toISOString()}] Starting daily cleanup...`);
      
      try {
        // Reset YouTube API request counter
        youtubeService.resetRequestCount();
        
        // Update channel averages for all channels
        const Channel = require('../models/Channel');
        const channels = await Channel.find({});
        
        for (const channel of channels) {
          await channel.updateAverageViews();
        }
        
        // Recalculate all outlier factors
        await dataProcessor.calculateOutlierFactors();
        
        // Store daily analytics snapshot
        await analyticsService.storeDailyAnalytics();
        
        console.log(`[${new Date().toISOString()}] Daily cleanup completed`);
        
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Daily cleanup failed:`, error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('cleanup', job);
    job.start();
    
    console.log('Daily cleanup job scheduled (midnight)');
  }

  // Hourly trending fetch - more frequent for hot content
  startHourlyTrendingJob() {
    const job = cron.schedule('0 * * * *', async () => {
      console.log(`[${new Date().toISOString()}] Starting hourly trending fetch...`);
      
      try {
        // Fetch smaller batch of trending videos more frequently
        await dataProcessor.fetchTrendingVideos(25);
        
        console.log(`[${new Date().toISOString()}] Hourly trending fetch completed`);
        
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Hourly trending fetch failed:`, error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('hourlyTrending', job);
    job.start();
    
    console.log('Hourly trending job scheduled');
  }

  // Start all scheduled jobs
  startAll() {
    this.startMainFetchJob();
    this.startViralAlertJob();
    this.startCleanupJob();
    this.startHourlyTrendingJob();
  }

  // Stop a specific job
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`Stopped job: ${jobName}`);
    }
  }

  // Stop all jobs
  stopAll() {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }
    this.jobs.clear();
  }

  // Get job status
  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    return status;
  }

  // Manual trigger for testing
  async triggerManualFetch() {
    console.log('Manual fetch triggered...');
    try {
      const results = await dataProcessor.fetchTrendingVideos(10);
      console.log('Manual fetch completed:', results);
      return results;
    } catch (error) {
      console.error('Manual fetch failed:', error);
      throw error;
    }
  }
}

module.exports = new Scheduler();