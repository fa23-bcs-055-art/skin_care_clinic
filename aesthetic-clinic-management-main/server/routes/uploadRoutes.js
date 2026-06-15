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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || req.query.folder || 'gallery';
    
    // ✅ FIX: Use absolute paths correctly
    const uploadDir = path.join(__dirname, '../public/uploads', folder);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📁 Created upload directory:", uploadDir);
    }
    
    console.log("📤 Uploading to folder:", folder);
    console.log("   Full path:", uploadDir);
    console.log("   Exists:", fs.existsSync(uploadDir));
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = name + '-' + uniqueSuffix + ext;
    console.log("📄 Generated filename:", filename);
    cb(null, filename);
  }
});

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
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

    // ✅ FIX: Use helper to get relative URL
    const imageUrl = getRelativeImageUrl(req.file.path);
    
    if (!imageUrl) {
      console.error("❌ Failed to generate image URL for:", req.file.path);
      return res.status(500).json({ error: 'Failed to generate image URL' });
    }
    
    console.log("📤 Image uploaded successfully:", {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      savedPath: req.file.path,
      imageUrl: imageUrl,
      folder: req.body.folder || 'gallery'
    });

    // Verify file actually exists
    if (!fs.existsSync(req.file.path)) {
      console.error("❌ File was not actually saved:", req.file.path);
      return res.status(500).json({ error: 'File upload failed - file not saved' });
    }
    
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

// Upload multiple images
router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const images = req.files.map(file => {
      const imageUrl = getRelativeImageUrl(file.path);
      return {
        url: imageUrl,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size
      };
    });

    console.log("📤 Multiple images uploaded:", {
      count: req.files.length,
      images: images.map(img => ({ filename: img.filename, url: img.url }))
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

// Delete image
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Search for file in all directories
    const directories = ['services', 'gallery', 'blogs', 'profiles', 'before-after'];
    let filePath = null;
    
    for (const dir of directories) {
      const potentialPath = path.join(__dirname, '../public/uploads', dir, filename);
      if (fs.existsSync(potentialPath)) {
        filePath = potentialPath;
        break;
      }
    }

    if (filePath) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Deleted file:", filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;