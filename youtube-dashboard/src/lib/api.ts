import axios from 'axios';
import { Video, Channel, ApiResponse, VideoStats, TrendingNiche, VelocitySnapshot, AlertSettings, AISuggestions, AnalyticsData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Videos API
export const videosApi = {
  getTrending: async (params?: {
    isShort?: boolean;
    minViews?: number;
    limit?: number;
  }): Promise<ApiResponse<Video[]>> => {
    const response = await api.get('/videos/trending', { params });
    return response.data;
  },

  getOutliers: async (limit?: number): Promise<ApiResponse<Video[]>> => {
    const response = await api.get('/videos/outliers', { params: { limit } });
    return response.data;
  },

  getShorts: async (params?: {
    limit?: number;
    minViews?: number;
  }): Promise<ApiResponse<Video[]>> => {
    const response = await api.get('/videos/shorts', { params });
    return response.data;
  },

  getLongForm: async (params?: {
    limit?: number;
    minViews?: number;
  }): Promise<ApiResponse<Video[]>> => {
    const response = await api.get('/videos/longform', { params });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<VideoStats>> => {
    const response = await api.get('/videos/stats/summary');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Video>> => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },
};

// Channels API
export const channelsApi = {
  getById: async (id: string): Promise<ApiResponse<Channel>> => {
    const response = await api.get(`/channels/${id}`);
    return response.data;
  },

  getVideos: async (
    id: string,
    params?: {
      isShort?: boolean;
      limit?: number;
      sortBy?: 'views' | 'outlier' | 'viewsPerHour';
    }
  ): Promise<ApiResponse<Video[]>> => {
    const response = await api.get(`/channels/${id}/videos`, { params });
    return response.data;
  },

  getAll: async (params?: {
    limit?: number;
    sortBy?: 'avgViews' | 'totalViews';
  }): Promise<ApiResponse<Channel[]>> => {
    const response = await api.get('/channels', { params });
    return response.data;
  },

  refresh: async (id: string): Promise<ApiResponse<Channel>> => {
    const response = await api.post(`/channels/${id}/refresh`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getStatus: async () => {
    const response = await api.get('/admin/status');
    return response.data;
  },

  triggerFetch: async () => {
    const response = await api.post('/admin/fetch/manual');
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getTrends: async (days?: number): Promise<ApiResponse<TrendingNiche[]>> => {
    const response = await api.get('/analytics/trends', { params: { days } });
    return response.data;
  },

  getHistorical: async (days?: number): Promise<ApiResponse<AnalyticsData[]>> => {
    const response = await api.get('/analytics/historical', { params: { days } });
    return response.data;
  },

  getVelocityCurve: async (videoId: string, hours?: number): Promise<ApiResponse<VelocitySnapshot[]>> => {
    const response = await api.get(`/analytics/velocity/${videoId}`, { params: { hours } });
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/analytics/insights');
    return response.data;
  },

  getEngagement: async (params?: { limit?: number; sortBy?: string }) => {
    const response = await api.get('/analytics/engagement', { params });
    return response.data;
  },
};

// Alerts API
export const alertsApi = {
  getSettings: async (): Promise<ApiResponse<AlertSettings>> => {
    const response = await api.get('/alerts/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<AlertSettings>): Promise<ApiResponse<AlertSettings>> => {
    const response = await api.put('/alerts/settings', settings);
    return response.data;
  },

  testAlert: async (type: 'discord' | 'email') => {
    const response = await api.post('/alerts/test', { type });
    return response.data;
  },

  checkAlerts: async () => {
    const response = await api.post('/alerts/check');
    return response.data;
  },
};

// AI API
export const aiApi = {
  getSuggestions: async (videoId: string): Promise<ApiResponse<AISuggestions>> => {
    const response = await api.post('/ai/suggestions', { videoId });
    return response.data;
  },

  getTitles: async (videoId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.post('/ai/titles', { videoId });
    return response.data;
  },

  getThumbnails: async (videoId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.post('/ai/thumbnails', { videoId });
    return response.data;
  },

  getTwists: async (videoId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.post('/ai/twists', { videoId });
    return response.data;
  },
};