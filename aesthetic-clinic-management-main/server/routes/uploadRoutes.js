const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create base directories
const baseDirs = [
  'public/uploads/services',
  'public/uploads/gallery',
  'public/uploads/blogs',
  'public/uploads/profiles',
  'public/uploads/before-after'
];

baseDirs.forEach(dir => createDirIfNotExists(path.join(__dirname, '../', dir)));

// Configure storage
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: fileFilter
});

// All upload routes require authentication
router.use(verifyToken);

// ✅ FIXED: Helper to get relative URL from absolute path
function getRelativeImageUrl(filePath) {
  // Normalize path to use forward slashes
  const normalized = filePath.replace(/\\/g, '/');
  // Split by 'uploads/' and take everything after it
  const parts = normalized.split('/uploads/');
  if (parts.length > 1) {
    return `/uploads/${parts[1]}`;
  }
  // Fallback: try to find uploads in path
  const uploadsIndex = normalized.indexOf('uploads/');
  if (uploadsIndex !== -1) {
    return `/${normalized.substring(uploadsIndex)}`;
  }
  console.error("❌ Could not extract relative path from:", filePath);
  return null;
}

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log("REQ FILE:", req.file);

    const b64 = req.file.buffer.toString('base64');
    const image = `data:${req.file.mimetype};base64,${b64}`;

    console.log("GENERATED DATA URI LENGTH:", image?.length);

    const response = {
      success: true,
      image: image
    };

    console.log("UPLOAD RESPONSE:", { success: response.success, imageLength: response.image.length });

    res.json(response);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const images = req.files.map(file => {
      const b64 = file.buffer.toString('base64');
      return {
        url: `data:${file.mimetype};base64,${b64}`,
        filename: file.originalname,
        originalname: file.originalname,
        size: file.size
      };
    });

    console.log("📤 Multiple images uploaded:", {
      count: req.files.length
    });

    res.json({
      success: true,
      images: images
    });

  } catch (error) {
    console.error('❌ Upload images error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete image (Stub)
router.delete('/:filename', async (req, res) => {
  res.json({ success: true, message: 'File deleted successfully (stub)' });
});

module.exports = router;
