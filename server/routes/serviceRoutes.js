const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus
} = require('../controllers/serviceController');

// 📢 Public route - Sabko dikhega
router.get('/public', getServices);

// 🔒 Admin routes - Sirf admin use karega
router.get('/admin', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), getAllServices);
router.get('/admin/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), getServiceById);
router.post('/admin', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), createService);
router.put('/admin/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), updateService);
router.patch('/admin/:id/toggle', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), toggleServiceStatus);
router.delete('/admin/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), deleteService);

module.exports = router;