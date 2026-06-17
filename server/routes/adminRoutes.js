const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { superAdminOnly } = require('../middleware/roleMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAuditLogs,
  getRoles,
  updateRolePermissions,
  getClinicSettings,
  updateClinicSettings,
  addHoliday,
  removeHoliday
} = require('../controllers/adminController');

// All routes require SuperAdmin access
router.use(verifyToken);
router.use(superAdminOnly);

// ========== USER MANAGEMENT ==========
router.get('/users', auditLog('VIEW_USERS'), getAllUsers);
router.put('/users/:id/role', auditLog('UPDATE_USER'), updateUserRole);
router.put('/users/:id/toggle-status', auditLog('TOGGLE_USER_STATUS'), toggleUserStatus);
router.delete('/users/:id', auditLog('DELETE_USER'), deleteUser);

// ========== AUDIT LOGS ==========
router.get('/audit-logs', auditLog('VIEW_AUDIT_LOGS'), getAuditLogs);

// ========== ROLE MANAGEMENT ==========
router.get('/roles', auditLog('VIEW_ROLES'), getRoles);
router.put('/roles/:id', auditLog('UPDATE_ROLE'), updateRolePermissions);

// ========== CLINIC SETTINGS ==========
router.get('/clinic-settings', auditLog('VIEW_SETTINGS'), getClinicSettings);
router.put('/clinic-settings', auditLog('UPDATE_SETTINGS'), updateClinicSettings);
router.post('/clinic-settings/holidays', auditLog('ADD_HOLIDAY'), addHoliday);
router.delete('/clinic-settings/holidays/:holidayId', auditLog('REMOVE_HOLIDAY'), removeHoliday);

module.exports = router;