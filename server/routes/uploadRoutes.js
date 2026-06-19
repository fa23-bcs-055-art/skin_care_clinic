const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/upload');

// ✅ FIXED: Helper to generate image URL from filename and folder
function getImageUrl(filename, folder) {
  if (!filename) return null;
  return `/uploads/${folder}/${filename}`;
}

// ✅ FIXED: Generate unique filename
function generateFilename(originalname) {
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${baseName}-${timestamp}-${random}${ext}`;
}

// All upload routes require authentication
router.use(verifyToken);

// ✅ COMPLETELY FIXED: Upload single image
router.post('/image', upload.single('image'), handleUploadError, async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // ✅ Get folder from request
    const folder = req.body.folder || req.query.folder || 'gallery';

    // ✅ Generate filename (fix for memory storage)
    const filename = generateFilename(req.file.originalname);

    // ✅ Build correct URL
    const imageUrl = getImageUrl(filename, folder);

    console.log('✅ Image uploaded:', {
      filename: filename,
      folder: folder,
      imageUrl: imageUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: filename,
      originalname: req.file.originalname,
      size: req.file.size,
      folder: folder
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ COMPLETELY FIXED: Upload multiple images
router.post('/images', upload.array('images', 10), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const folder = req.body.folder || req.query.folder || 'gallery';

    const images = req.files.map(file => {
      const filename = generateFilename(file.originalname);
      return {
        url: getImageUrl(filename, folder),
        filename: filename,
        originalname: file.originalname,
        size: file.size
      };
    });

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

// ✅ Delete image
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