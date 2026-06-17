const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ========== ADMIN ROUTES ==========
router.get('/', verifyToken, isAdmin, inventoryController.getAllItems);
router.get('/stats', verifyToken, isAdmin, inventoryController.getInventoryStats);
router.post('/', verifyToken, isAdmin, inventoryController.createItem);
router.put('/:id', verifyToken, isAdmin, inventoryController.updateItem);
router.delete('/:id', verifyToken, isAdmin, inventoryController.deleteItem);

// ✅ Add stock route
router.post('/:id/add-stock', verifyToken, isAdmin, inventoryController.addStock);

// ✅ Remove stock route (for usage tracking)

router.post('/:id/remove-stock', verifyToken, isAdmin, inventoryController.removeStock);

// Get inventory logs
router.get('/logs', verifyToken, isAdmin, inventoryController.getInventoryLogs);

module.exports = router;