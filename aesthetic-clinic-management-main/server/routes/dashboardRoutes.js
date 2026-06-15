const express = require('express');
const router = express.Router();

// Controllers
const dashboardController = require('../controllers/dashboardController');

// Middleware
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ========== ADMIN ROUTES (Admin/SuperAdmin only) ==========
// ✅ FIXED: Correct way to apply middleware
router.get('/full', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), dashboardController.getFullDashboard);
router.get('/admin', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), dashboardController.getAdminDashboard);

// ========== USER ROUTE (Any authenticated user) ==========
// ✅ User dashboard - Patient ke liye
router.get('/user', verifyToken, dashboardController.getUserDashboard);

module.exports = router;