const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.requestCount = 0;
  }

  // Parse ISO 8601 duration to seconds
  parseDuration(duration) {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Check if video is a Short
  isVideoShort(duration, title, description) {
    const durationSeconds = this.parseDuration(duration);
    const hasShortHashtag = (title + ' ' + description).toLowerCase().includes('#shorts');
    
    return durationSeconds <= 60 || hasShortHashtag;
  }

  // Fetch trending videos
  async getTrendingVideos(maxResults = 50, categoryId = null) {
    try {
      this.requestCount++;
      
      const params = {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        maxResults,
        regionCode: 'US',
        key: this.apiKey
      };

      if (categoryId) {
        params.videoCategoryId = categoryId;
      }

      const response = await axios.get(`${this.baseUrl}/videos`, { params });
      
      return this.processVideoData(response.data.items);
    } catch (error) {
      console.error('Error fetching trending videos:', error.response?.data || error.message);
      throw error;
    }
  }

  // Fetch video details by IDs
  async getVideoDetails(videoIds) {
    try {
      this.requestCount++;
      
      const params = {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
        key: this.apiKey
      };

      const response = await axios.get(`${this.baseUrl}/videos`, { params });
      
      return this.processVideoData(response.data.items);
    } catch (error) {
      console.error('Error fetching video details:', error.response?.data || error.message);
      throw error;
    }
  }

  // Fetch channel details
  async getChannelDetails(channelId) {
    try {
      this.requestCount++;
      
      const params = {
        part: 'snippet,statistics',
        id: channelId,
        key: this.apiKey
      };

      const response = await axios.get(`${this.baseUrl}/channels`, { params });
      
      if (response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = response.data.items[0];
      
      return {
        channelId: channel.id,
        channelName: channel.snippet.title,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        totalViews: parseInt(channel.statistics.viewCount) || 0,
        uploadCount: parseInt(channel.statistics.videoCount) || 0,
        channelAge: new Date(channel.snippet.publishedAt),
        customUrl: channel.snippet.customUrl,
        description: channel.snippet.description,
        country: channel.snippet.country
      };
    } catch (error) {
      console.error('Error fetching channel details:', error.response?.data || error.message);
      throw error;
    }
  }

  // Process video data from YouTube API
  processVideoData(items) {
    return items.map(item => {
      const snippet = item.snippet;
      const statistics = item.statistics;
      const contentDetails = item.contentDetails;

      const lengthSeconds = this.parseDuration(contentDetails.duration);
      const isShort = this.isVideoShort(
        contentDetails.duration,
        snippet.title,
        snippet.description
      );

      const uploadTime = new Date(snippet.publishedAt);
      const hoursOld = (Date.now() - uploadTime.getTime()) / (1000 * 60 * 60);
      const views = parseInt(statistics.viewCount) || 0;
      const viewsPerHour = hoursOld > 0 ? views / hoursOld : 0;

      return {
        videoId: item.id,
        channelId: snippet.channelId,
        title: snippet.title,
        description: snippet.description,
        tags: snippet.tags || [],
        category: snippet.categoryId || 'Unknown',
        lengthSeconds,
        isShort,
        views,
        likes: parseInt(statistics.likeCount) || 0,
        comments: parseInt(statistics.commentCount) || 0,
        viewsPerHour: Math.round(viewsPerHour),
        uploadTime,
        dataFetchedAt: new Date(),
        trending: true
      };
    });
  }

  // Search for videos by query
  async searchVideos(query, maxResults = 25) {
    try {
      this.requestCount++;
      
      const searchParams = {
        part: 'snippet',
        q: query,
        type: 'video',
        order: 'viewCount',
        publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        maxResults,
        key: this.apiKey
      };

      const searchResponse = await axios.get(`${this.baseUrl}/search`, { 
        params: searchParams 
      });

      const videoIds = searchResponse.data.items.map(item => item.id.videoId);
      
      if (videoIds.length === 0) {
        return [];
      }

      return await this.getVideoDetails(videoIds);
    } catch (error) {
      console.error('Error searching videos:', error.response?.data || error.message);
      throw error;
    }
  }

  getRequestCount() {
    return this.requestCount;
  }

  resetRequestCount() {
    this.requestCount = 0;
  }
}

module.exports = new YouTubeService();