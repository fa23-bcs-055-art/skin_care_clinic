const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create all upload directories
const baseDirs = [
  'public/uploads/services',
  'public/uploads/gallery',
  'public/uploads/blogs',
  'public/uploads/profiles',
  'public/uploads/before-after',
  'public/uploads/payments'
];

// Use absolute paths
const rootDir = path.join(__dirname, '..');
if (process.env.NODE_ENV !== 'production') {
  baseDirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    createDirIfNotExists(fullPath);
    console.log(`📁 Directory ready: ${fullPath}`);
  });
}

// Configure storage
const storage = process.env.NODE_ENV === 'production' 
  ? multer.memoryStorage() 
  : multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(rootDir, 'public/uploads/');

    // Determine folder based on request
    if (req.baseUrl && req.baseUrl.includes('services')) {
      uploadPath = path.join(rootDir, 'public/uploads/services/');
    } else if (req.baseUrl && req.baseUrl.includes('gallery')) {
      if (req.body.type === 'before-after') {
        uploadPath = path.join(rootDir, 'public/uploads/before-after/');
      } else {
        uploadPath = path.join(rootDir, 'public/uploads/gallery/');
      }
    } else if (req.baseUrl && req.baseUrl.includes('blogs')) {
      uploadPath = path.join(rootDir, 'public/uploads/blogs/');
    } else if (req.baseUrl && req.baseUrl.includes('profile')) {
      uploadPath = path.join(rootDir, 'public/uploads/profiles/');
    } else if (req.path && req.path.includes('upload-screenshot')) {
      uploadPath = path.join(rootDir, 'public/uploads/payments/');
    }

    // Ensure directory exists
    createDirIfNotExists(uploadPath);
    console.log(`📤 Upload destination: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = name + '-' + uniqueSuffix + ext;
    console.log(`📄 Generated filename: ${filename}`);
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

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, handleUploadError };