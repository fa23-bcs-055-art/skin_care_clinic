const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getDoctor,
  updateDoctor
} = require('../controllers/doctorController');

// 📢 Public route
router.get('/', getDoctor);

// 🔒 Admin route
router.put('/', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), updateDoctor);

module.exports = router;