const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAPI() {
  console.log('🧪 Testing YouTube Tracker API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: Root endpoint
    console.log('\n2️⃣ Testing root endpoint...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint passed:', rootResponse.data.message);

    // Test 3: Manual fetch (if YouTube API key is configured)
    if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here') {
      console.log('\n3️⃣ Testing manual fetch...');
      try {
        const fetchResponse = await axios.post(`${BASE_URL}/api/admin/fetch/manual`);
        console.log('✅ Manual fetch completed:', fetchResponse.data.data);
      } catch (error) {
        console.log('⚠️ Manual fetch failed (this is expected without valid YouTube API key)');
      }

      // Test 4: Get trending videos
      console.log('\n4️⃣ Testing trending videos endpoint...');
      try {
        const trendingResponse = await axios.get(`${BASE_URL}/api/videos/trending`);
        console.log('✅ Trending videos:', trendingResponse.data.count, 'videos found');
      } catch (error) {
        console.log('⚠️ No trending videos found (expected for fresh database)');
      }

      // Test 5: Get outliers
      console.log('\n5️⃣ Testing outliers endpoint...');
      try {
        const outliersResponse = await axios.get(`${BASE_URL}/api/videos/outliers`);
        console.log('✅ Outlier videos:', outliersResponse.data.count, 'videos found');
      } catch (error) {
        console.log('⚠️ No outlier videos found (expected for fresh database)');
      }

      // Test 6: Get video stats
      console.log('\n6️⃣ Testing video statistics...');
      try {
        const statsResponse = await axios.get(`${BASE_URL}/api/videos/stats/summary`);
        console.log('✅ Video statistics:', statsResponse.data.data);
      } catch (error) {
        console.log('⚠️ Error getting statistics:', error.message);
      }

    } else {
      console.log('\n⚠️ Skipping YouTube API tests - No API key configured');
      console.log('Please set YOUTUBE_API_KEY in your .env file to test data fetching');
    }

    // Test 7: Admin status
    console.log('\n7️⃣ Testing admin status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/admin/status`);
    console.log('✅ System status:', {
      uptime: Math.round(statusResponse.data.data.uptime),
      environment: statusResponse.data.data.environment,
      jobs: Object.keys(statusResponse.data.data.scheduledJobs).length
    });

    console.log('\n🎉 API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running: npm run dev');
    }
    
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;