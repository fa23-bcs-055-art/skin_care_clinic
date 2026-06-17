const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(verifyToken);

// Profile routes (must come before /:id)
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// Custom access control for GET /users
const allowGetUsers = (req, res, next) => {
  if (['SuperAdmin', 'Admin'].includes(req.user.role)) {
    return next();
  }
  // Allow fetching doctors for booking appointments
  if (req.method === 'GET' && req.query.role === 'Doctor') {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Access denied" });
};

// Custom access control for /:id
const allowUserId = (req, res, next) => {
  if (['SuperAdmin', 'Admin'].includes(req.user.role)) {
    return next();
  }
  // Allow accessing own profile
  if (req.params.id && req.user.id.toString() === req.params.id) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Access denied" });
};

// User management routes
router.get('/', allowGetUsers, userController.getAllUsers);
router.post('/', authorizeRoles('SuperAdmin', 'Admin'), userController.createUser);
router.get('/:id', allowUserId, userController.getUserById);
router.put('/:id', allowUserId, userController.updateUser);
router.put('/:id/status', authorizeRoles('SuperAdmin'), userController.updateUserStatus);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin'), userController.deleteUser);

module.exports = router;
