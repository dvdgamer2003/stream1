require('dotenv').config();
const { cloudinary, cloudinaryHelper } = require('../config/cloudinary');

async function testCloudinaryConfig() {
    try {
        console.log('Testing Cloudinary Configuration...');
        
        // Test basic configuration
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('API Key:', process.env.CLOUDINARY_API_KEY);
        
        // Test connection by getting account info
        const account = await cloudinary.api.ping();
        console.log('Cloudinary Connection Test:', account.status === 'ok' ? 'Success' : 'Failed');
        
        // Test URL generation
        const testUrl = cloudinaryHelper.getVideoUrl('sample');
        console.log('Test Video URL Generation:', testUrl);
        
        // Test thumbnail generation
        const testThumbnail = cloudinaryHelper.generateThumbnail('sample');
        console.log('Test Thumbnail URL Generation:', testThumbnail);
        
        console.log('\nCloudinary Configuration Test Completed Successfully!');
    } catch (error) {
        console.error('Error testing Cloudinary configuration:', error);
    }
}

testCloudinaryConfig();
