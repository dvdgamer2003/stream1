const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper functions for video operations
const cloudinaryHelper = {
  // Upload video with optimizations
  uploadVideo: async (filePath, options = {}) => {
    const defaultOptions = {
      resource_type: 'video',
      folder: 'videos',
      eager: [
        { 
          streaming_profile: 'full_hd',
          format: 'mp4',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        }
      ],
      eager_async: true,
      eager_notification_url: process.env.VIDEO_NOTIFICATION_WEBHOOK,
      allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
      max_file_size: 500 * 1024 * 1024 // 500MB
    };

    const uploadOptions = { ...defaultOptions, ...options };
    return await cloudinary.uploader.upload(filePath, uploadOptions);
  },

  // Generate optimized video URL
  getVideoUrl: (publicId, options = {}) => {
    const defaultOptions = {
      resource_type: 'video',
      fetch_format: 'auto',
      quality: 'auto',
      secure: true
    };

    const urlOptions = { ...defaultOptions, ...options };
    return cloudinary.url(publicId, urlOptions);
  },

  // Generate video thumbnail
  generateThumbnail: (publicId, options = {}) => {
    const defaultOptions = {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 320, crop: 'scale' },
        { fetch_format: 'auto' },
        { quality: 'auto' }
      ]
    };

    const thumbnailOptions = { ...defaultOptions, ...options };
    return cloudinary.url(publicId, thumbnailOptions);
  },

  // Delete video
  deleteVideo: async (publicId) => {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  }
};

module.exports = { cloudinary, cloudinaryHelper };
