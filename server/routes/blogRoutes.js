const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getPublishedBlogs,
  getBlog,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');

// 📢 Public routes
router.get('/published', getPublishedBlogs);
router.get('/:id', getBlog);

// 🔒 Admin routes
router.get('/', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), getAllBlogs);
router.post('/', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), createBlog);
router.put('/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), updateBlog);
router.delete('/:id', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), deleteBlog);

module.exports = router;