const express = require('express');
const router = express.Router();




// Multer storage config
const { upload } = require('../middleware/upload');
const paymentController = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Debug check to prevent crash
if (!paymentController.getPaymentStats) {
    console.error("❌ ERROR: getPaymentStats is missing in paymentController!");
}

// ========== ADMIN ROUTES ==========
router.get('/stats', verifyToken, isAdmin, paymentController.getPaymentStats);
router.get('/debug', verifyToken, isAdmin, paymentController.debugPayments);

// ========== USER ROUTES ==========
router.get('/my-payments', verifyToken, paymentController.getMyPayments);
router.get('/invoice/:paymentId', verifyToken, paymentController.getInvoiceByPaymentId);
// Use multer middleware to accept `screenshot` file
// Allow unauthenticated uploads so guest users can upload payment screenshots
// router.post('/upload-screenshot', upload.single('screenshot'), paymentController.uploadScreenshot); // Disabled to avoid auth conflict

// ========== SPECIFIC ACTIONS ==========
router.put('/:id/approve', verifyToken, isAdmin, paymentController.approvePayment);
router.put('/:id/reject', verifyToken, isAdmin, paymentController.rejectPayment);

// ========== CRUD ROUTES ==========
router.post('/', verifyToken, paymentController.createPayment);
router.get('/', verifyToken, isAdmin, paymentController.getAllPayments);
router.get('/:id', verifyToken, paymentController.getPaymentById);
router.put('/:id', verifyToken, isAdmin, paymentController.updatePayment);
router.delete('/:id', verifyToken, isAdmin, paymentController.deletePayment);

module.exports = router;
