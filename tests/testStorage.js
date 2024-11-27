require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const { testAuth } = require('./testAuth');

const API_URL = 'http://localhost:3000/api';

async function testStorage() {
    try {
        console.log('Testing Storage Routes...\n');

        // First get auth token
        const authToken = await testAuth();
        
        // Create a test video file
        const testVideoPath = path.join(__dirname, 'test-video.mp4');
        if (!fs.existsSync(testVideoPath)) {
            // Create a small test video file
            const sampleData = Buffer.alloc(1024 * 1024); // 1MB file
            fs.writeFileSync(testVideoPath, sampleData);
        }

        // Test Video Upload
        console.log('1. Testing Video Upload...');
        const formData = new FormData();
        formData.append('video', fs.createReadStream(testVideoPath));
        formData.append('title', 'Test Video Upload');

        const uploadResponse = await axios.post(`${API_URL}/videos/upload`, formData, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log('Upload Success:', uploadResponse.data);
        const videoId = uploadResponse.data.id;
        console.log('----------------------------------------\n');

        // Test Get Videos
        console.log('2. Testing Get Videos...');
        const getVideosResponse = await axios.get(`${API_URL}/videos/my-videos`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Get Videos Success:', getVideosResponse.data);
        console.log('----------------------------------------\n');

        // Test Search Videos
        console.log('3. Testing Search Videos...');
        const searchResponse = await axios.get(`${API_URL}/videos/search?query=Test`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Search Success:', searchResponse.data);
        console.log('----------------------------------------\n');

        // Test Delete Video
        console.log('4. Testing Delete Video...');
        const deleteResponse = await axios.delete(`${API_URL}/videos/${videoId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('Delete Success:', deleteResponse.data);
        console.log('----------------------------------------\n');

        // Cleanup
        if (fs.existsSync(testVideoPath)) {
            fs.unlinkSync(testVideoPath);
        }

        console.log('All Storage Tests Passed! ✅');

    } catch (error) {
        console.error('Storage Test Failed ❌');
        console.error('Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Run the test if this file is run directly
if (require.main === module) {
    testStorage();
}
