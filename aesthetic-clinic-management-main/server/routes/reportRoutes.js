const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.use(authorizeRoles('Admin', 'SuperAdmin'));

router.get('/financial-summary', reportController.getFinancialSummary);

module.exports = router;