# YouTube Shorts & Long-Form Video Tracker Backend

A comprehensive Node.js backend for tracking YouTube Shorts and Long-Form videos, calculating outlier metrics, and providing analytics through REST APIs.

## 🚀 Features

- **Automated Data Fetching**: Scheduled fetching of trending videos every 15 minutes
- **Smart Shorts Detection**: Automatically detects YouTube Shorts based on duration and hashtags
- **Outlier Analysis**: Calculates outlier factors by comparing video performance to channel baselines
- **MongoDB Integration**: Efficient data storage with proper indexing for fast queries
- **REST API**: Complete API for accessing trending videos, outliers, and channel data
- **Admin Controls**: Administrative endpoints for manual operations and system monitoring

## 📊 Database Schema

### Video Schema
- `videoId`: Unique YouTube video ID
- `channelId`: YouTube channel ID
- `title`, `description`, `tags`: Video metadata
- `lengthSeconds`: Video duration in seconds
- `isShort`: Boolean flag for YouTube Shorts
- `views`, `likes`, `comments`: Engagement metrics
- `viewsPerHour`: Performance metric
- `outlierFactor`: Performance vs channel baseline
- `uploadTime`, `dataFetchedAt`: Timestamps

### Channel Schema
- `channelId`: Unique YouTube channel ID
- `channelName`: Channel display name
- `subscriberCount`, `totalViews`, `uploadCount`: Channel statistics
- `avgViewsLast5`: Average views of last 5 videos (baseline)

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file with your configuration:

```env
# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/youtube_tracker

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your `.env` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Or use MongoDB Atlas cloud database
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 API Endpoints

### Videos
- `GET /api/videos/trending` - Get trending videos
- `GET /api/videos/outliers` - Get videos with highest outlier factors
- `GET /api/videos/shorts` - Get YouTube Shorts only
- `GET /api/videos/longform` - Get long-form videos only
- `GET /api/videos/stats/summary` - Get overall statistics
- `GET /api/videos/:id` - Get specific video details

### Channels
- `GET /api/channels/:id` - Get channel details and recent videos
- `GET /api/channels/:id/videos` - Get all videos from a channel
- `GET /api/channels` - Get all tracked channels
- `POST /api/channels/:id/refresh` - Manually refresh channel data

### Admin
- `GET /api/admin/status` - Get system status and job information
- `POST /api/admin/fetch/manual` - Trigger manual data fetch
- `POST /api/admin/jobs/start` - Start all scheduled jobs
- `POST /api/admin/jobs/stop` - Stop all scheduled jobs
- `POST /api/admin/outliers/calculate` - Recalculate outlier factors

### Query Parameters

Most endpoints support filtering:
- `isShort=true/false` - Filter by video type
- `limit=50` - Limit number of results
- `minViews=1000` - Minimum view count
- `sortBy=views/outlier/viewsPerHour` - Sort criteria

## 🕐 Scheduled Jobs

The system runs three automated jobs:

1. **Main Fetch** (every 15 minutes): Fetches trending videos and updates existing video stats
2. **Hourly Trending** (every hour): Quick fetch of latest trending content
3. **Daily Cleanup** (midnight): Resets counters, updates channel averages, recalculates outliers

## 🧪 Testing

Run the API test suite:

```bash
npm run test:api
```

This will test all endpoints and verify the system is working correctly.

## 📈 Outlier Detection

The system calculates outlier factors using this formula:

```
outlierFactor = currentVideoViews / channelAverageViewsLast5Videos
```

- Values > 1.0 indicate above-average performance
- Values > 2.0 indicate significant outliers
- Values > 5.0 indicate potential viral content

## 🔒 Rate Limiting

The YouTube API has quotas:
- 10,000 units per day by default
- Each video details request costs 1 unit
- Each channel details request costs 1 unit

The system tracks API usage and provides monitoring through admin endpoints.

## 📁 Project Structure

```
src/
├── config/         # Database and configuration
├── models/         # MongoDB schemas
├── routes/         # API routes
├── services/       # Business logic and external APIs
├── tests/          # API tests
└── app.js          # Main application file
```

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Ensure your YouTube API key has sufficient quota
4. Consider using PM2 for process management

## 📊 Performance Monitoring

Monitor system performance through:
- `/api/admin/status` - System uptime and job status
- API request counting for YouTube quota management
- Database query performance through MongoDB indexes
- Scheduled job execution logs

## 🎯 Next Steps

This backend is ready for frontend integration and provides:
- Real-time trending video data
- Shorts vs Long-form categorization
- Outlier detection for viral content identification
- Comprehensive channel analytics
- Automated data updates

Perfect foundation for building analytics dashboards, content discovery tools, or performance monitoring applications.