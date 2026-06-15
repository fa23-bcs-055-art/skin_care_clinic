const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  submitTestimonial,
  getApprovedTestimonials,
  getAllTestimonials,
  updateTestimonial,
  deleteTestimonial,
  toggleStatus
} = require('../controllers/testimonialController');

// 📢 Public routes
router.post('/public', submitTestimonial);  // For users to submit
router.get('/approved', getApprovedTestimonials);  // For frontend display

// 🔒 Admin routes
router.get('/all', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), getAllTestimonials);
router.put('/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), updateTestimonial);
router.patch('/:id/toggle', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), toggleStatus);
router.delete('/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), deleteTestimonial);

module.exports = router;