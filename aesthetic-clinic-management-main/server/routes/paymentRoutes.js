const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'payments');
fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `payment_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage, limits: { fileSize: 6 * 1024 * 1024 } });
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
router.post('/upload-screenshot', upload.single('screenshot'), paymentController.uploadScreenshot);

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