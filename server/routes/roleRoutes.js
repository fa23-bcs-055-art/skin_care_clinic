const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles, superAdminOnly } = require('../middleware/roleMiddleware');

// Read routes — accessible by both Admin and SuperAdmin (for dropdowns etc.)
router.get('/permissions', authorizeRoles('SuperAdmin', 'Admin'), roleController.getPermissions);
router.get('/', authorizeRoles('SuperAdmin', 'Admin'), roleController.getAllRoles);
router.get('/:id', authorizeRoles('SuperAdmin', 'Admin'), roleController.getRoleById);

// Write routes — SuperAdmin only
router.post('/', superAdminOnly, roleController.createRole);
router.put('/:id', superAdminOnly, roleController.updateRole);
router.delete('/:id', superAdminOnly, roleController.deleteRole);

module.exports = router;
