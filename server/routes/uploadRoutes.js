const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/upload');

// Helper: Convert absolute path to URL
function getImageUrl(file) {
  // If file.path exists (disk storage), convert to URL, otherwise use filename only.
  if (file.path) {
    const normalized = file.path.replace(/\\/g, '/');
    const parts = normalized.split('/uploads/');
    if (parts.length > 1) return `/uploads/${parts[1]}`;
    const idx = normalized.indexOf('uploads/');
    if (idx !== -1) return `/${normalized.substring(idx)}`;
  }
  // Fallback: assume file is stored in /public/uploads and use filename
  return `/uploads/${file.filename}`;
}


// All upload routes require authentication
router.use(verifyToken);

// ✅ Upload single image - FIXED
router.post('/image', upload.single('image'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = getImageUrl(req.file);

    if (!imageUrl) {
      console.error('❌ Failed to generate image URL for:', req.file);
      return res.status(500).json({ error: 'Failed to generate image URL' });
    }

    // Verify file exists
    // In production memory storage, req.file.path may be undefined; skip existence check.
    if (req.file.path && !fs.existsSync(req.file.path)) {
      console.error('❌ File was not saved:', req.file.path);
      return res.status(500).json({ error: 'File upload failed - file not saved' });
    }

    console.log('✅ Image uploaded:', {
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });

    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Upload multiple images - FIXED
router.post('/images', upload.array('images', 10), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const images = req.files.map(file => ({
      url: getImageUrl(file),
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    }));

    console.log('✅ Multiple images uploaded:', images.length);

    res.json({
      success: true,
      images: images
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete image - FIXED
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const directories = ['services', 'gallery', 'blogs', 'profiles', 'before-after', 'payments'];
    const rootDir = path.join(__dirname, '..');

    let filePath = null;
    for (const dir of directories) {
      const potentialPath = path.join(rootDir, 'public/uploads', dir, filename);
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        break;
      }
    }

    if (filePath) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Deleted file:', filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }

  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;