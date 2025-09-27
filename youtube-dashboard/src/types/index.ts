export interface Video {
  _id: string;
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  lengthSeconds: number;
  isShort: boolean;
  views: number;
  likes: number;
  comments: number;
  viewsPerHour: number;
  uploadTime: string;
  dataFetchedAt: string;
  outlierFactor: number;
  trending: boolean;
}

export interface Channel {
  _id: string;
  channelId: string;
  channelName: string;
  subscriberCount: number;
  totalViews: number;
  uploadCount: number;
  channelAge: string;
  avgViewsLast5: number;
  customUrl?: string;
  description?: string;
  country?: string;
  lastUpdated: string;
  recentVideos?: Video[];
  totalVideosTracked?: number;
  shortsCount?: number;
  longFormCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

export interface VideoStats {
  totalVideos: number;
  totalShorts: number;
  totalLongForm: number;
  trendingVideos: number;
  topOutliers: Video[];
  percentageShorts: string;
}

export interface TrendingNiche {
  category: string;
  count: number;
  avgViews: number;
  avgOutlier: number;
  heatScore: number;
  totalViews: number;
}

export interface VelocitySnapshot {
  timestamp: string;
  views: number;
  viewsPerHour: number;
  engagementRate: number;
}

export interface AlertSettings {
  _id: string;
  userId: string;
  outlierThreshold: number;
  discordWebhook: {
    enabled: boolean;
    url: string;
  };
  emailAlerts: {
    enabled: boolean;
    email: string;
    frequency: 'immediate' | '6hours' | '12hours' | 'daily';
  };
  categories: string[];
  minViews: number;
}

export interface AISuggestions {
  titles: string[];
  thumbnails: string[];
  twists: string[];
  generated: string;
}

export interface AnalyticsData {
  date: string;
  totalVideos: number;
  totalShorts: number;
  totalLongForm: number;
  avgEngagementRate: number;
  topNiches: TrendingNiche[];
  outlierCount: number;
}