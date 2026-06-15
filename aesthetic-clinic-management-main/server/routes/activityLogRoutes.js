const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getAllLogs,
  getUserLogs,
  getRecentLogs,
  getLogsByAction,
  getLogsByDateRange,
  deleteOldLogs
} = require('../controllers/activityLogController');

// All routes require authentication and admin access
router.use(verifyToken);
router.use(authorizeRoles('SuperAdmin', 'Admin'));

// Get all logs with pagination
router.get('/', getAllLogs);

// Get recent logs
router.get('/recent', getRecentLogs);

// Get logs by user
router.get('/user/:userId', getUserLogs);

// Get logs by action type
router.get('/action/:action', getLogsByAction);

// Get logs by date range
router.get('/range', getLogsByDateRange);

// Delete old logs (cleanup)
router.delete('/cleanup', authorizeRoles('SuperAdmin'), deleteOldLogs);

module.exports = router;