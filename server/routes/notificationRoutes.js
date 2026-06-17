const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(verifyToken);

// IMPORTANT: Specific routes must come before parameterized routes
// Mark all as read - this MUST be before the /:id route
router.put('/mark-all/read', notificationController.markAllAsRead);

// Get user's notifications
router.get('/', notificationController.getUserNotifications);

// Mark a single notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;