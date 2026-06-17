const fs = require('fs');
const path = require('path');

// Upload single image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate URL for the uploaded file
    const imageUrl = `/uploads/${req.file.path.split('public/')[1]}`;
    
    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const images = req.files.map(file => ({
      url: `/uploads/${file.path.split('public/')[1]}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    }));

    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../public/uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
};