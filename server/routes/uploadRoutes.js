// server/routes/uploadRoutes.js
// Updated upload routes: in‑memory storage, Base64 data‑URI responses, no filesystem writes.

const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');
const { bufferToDataUri } = require('../services/imageService');

// ------------------------------------------------------------
// Single image upload – returns a Base64 data URI.
// ------------------------------------------------------------
router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const dataUri = bufferToDataUri(req.file.buffer, req.file.mimetype);
    console.log('📤 Image uploaded – Base64 generated', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    res.json({
      success: true,
      imageBase64: dataUri,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    next(err);
  }
}, handleUploadError);

// ------------------------------------------------------------
// Multiple images upload – returns an array of Base64 data URIs.
// ------------------------------------------------------------
router.post('/images', upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const images = req.files.map(file => {
      const dataUri = bufferToDataUri(file.buffer, file.mimetype);
      return {
        imageBase64: dataUri,
        filename: file.originalname,
        size: file.size
      };
    });
    console.log('📤 Multiple images uploaded – count', images.length);
    res.json({ success: true, images });
  } catch (err) {
    next(err);
  }
}, handleUploadError);

// ------------------------------------------------------------
// Delete route – retained for compatibility but not used because images are stored in DB.
// ------------------------------------------------------------
router.delete('/:filename', (req, res) => {
  res.status(404).json({ error: 'File deletion not applicable – images are stored in MongoDB as Base64' });
});

module.exports = router;