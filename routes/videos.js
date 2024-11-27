const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinaryHelper } = require('../config/cloudinary');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|avi|mov|mkv)$/)) {
      return cb(new Error('Please upload a valid video file'));
    }
    cb(undefined, true);
  }
});

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Upload to Cloudinary with optimizations
    const result = await cloudinaryHelper.uploadVideo(req.file.path, {
      public_id: `${req.user.user_id}/${Date.now()}`,
      resource_type: 'video',
      eager: [
        { 
          streaming_profile: 'full_hd',
          format: 'mp4',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        }
      ]
    });

    // Generate thumbnail
    const thumbnailUrl = cloudinaryHelper.generateThumbnail(result.public_id);

    // Save to database
    const { data: video, error } = await supabase
      .from('video_links')
      .insert([{
        user_id: req.user.user_id,
        title: req.body.title || 'Untitled',
        video_url: result.secure_url,
        thumbnail_url: thumbnailUrl,
        cloudinary_id: result.public_id,
        duration: result.duration,
        format: result.format,
        upload_date: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading video' });
  }
});

// Get user's videos with pagination
router.get('/my-videos', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { data: videos, error, count } = await supabase
      .from('video_links')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.user_id)
      .order('upload_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      videos,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit),
        total_videos: count
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching videos' });
  }
});

// Search videos
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let supabaseQuery = supabase
      .from('video_links')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.user_id);

    if (query) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
    }

    const { data: videos, error, count } = await supabaseQuery
      .order('upload_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      videos,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit),
        total_videos: count
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error searching videos' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const { data: video } = await supabase
      .from('video_links')
      .select('cloudinary_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.user_id)
      .single();

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from Cloudinary
    await cloudinaryHelper.deleteVideo(video.cloudinary_id);

    // Delete from database
    const { error } = await supabase
      .from('video_links')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.user_id);

    if (error) throw error;

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting video' });
  }
});

module.exports = router;
