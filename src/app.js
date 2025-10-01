require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.use('/api/videos', require('./routes/videos'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: '🎉 YouTube Tracker Backend is running!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB if URI is provided (optional)
    if (process.env.MONGO_URI) {
      try {
        await connectDB();
        console.log("✅ Connected to MongoDB");
      } catch (error) {
        console.log("⚠️  MongoDB connection failed, running without database");
        console.log("   To use database features, ensure MongoDB is running or check MONGO_URI");
      }
    } else {
      console.log("⚠️  No MongoDB URI provided, running without database");
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Visit: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('Server startup error:', error);
    console.log('🚀 Starting server without database...');
    
    // Start the server anyway
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without database)`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Visit: http://localhost:${PORT}`);
    });
  }
};

startServer();

module.exports = app;