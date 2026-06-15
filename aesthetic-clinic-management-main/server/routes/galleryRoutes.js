const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getActiveGallery,
  getBeforeAfter,
  getAllGallery,
  uploadImage,
  uploadBeforeAfter,
  updateImage,
  deleteImage,
  deleteBeforeAfter
} = require('../controllers/galleryController');

// 📢 Public routes
router.get('/active', getActiveGallery);
router.get('/before-after', getBeforeAfter);

// 🔒 Admin routes
router.get('/', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), getAllGallery);
router.post('/', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), uploadImage);
router.post('/before-after', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), uploadBeforeAfter);
router.put('/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), updateImage);
router.delete('/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), deleteImage);
router.delete('/before-after/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), deleteBeforeAfter);

module.exports = router;