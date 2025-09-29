import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Video {
  videoId: string;
  title: string;
  channelId: string;
  views: number;
  likes: number;
  comments: number;
  viewsPerHour: number;
  isShort: boolean;
  outlierFactor: number;
  trending: boolean;
  uploadTime: string;
  lengthSeconds: number;
  category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

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

  getStats: async () => {
    const response = await api.get('/videos/stats/summary');
    return response.data;
  },
};

// Channels API
export const channelsApi = {
  getById: async (id: string) => {
    const response = await api.get(`/channels/${id}`);
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