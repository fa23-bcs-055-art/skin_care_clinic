const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { verifyToken } = require('../middleware/authMiddleware');
// Note: If authorizeRoles is defined in authMiddleware, import it from there
const { authorizeRoles } = require('../middleware/roleMiddleware'); 

// Apply middleware to all payroll routes
router.use(verifyToken);
router.use(authorizeRoles('Admin', 'SuperAdmin'));

// --- ROUTES ---
router.get('/employees', payrollController.getEmployeesForConfig);
router.get('/config/:userId', payrollController.getConfig);
router.post('/config/:userId', payrollController.saveConfig);
router.get('/default-salaries', payrollController.getDefaultSalaryByRole);

router.post('/generate', payrollController.generateBatch);
router.get('/batch', payrollController.getBatch);
router.put('/slips/:id/status', payrollController.updateStatus);

router.get('/export/bank', payrollController.exportBankFile);
router.get('/summary', payrollController.getPayrollSummary);
router.get('/slips/:id', payrollController.getSalarySlip);

module.exports = router;