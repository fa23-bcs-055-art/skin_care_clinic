const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// ✅ FIX: Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'payments');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created payments upload directory:', uploadDir);
}

// ✅ FIX: Multer setup for payment screenshots
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `payment_${Date.now()}${ext}`;
        console.log('📄 Payment screenshot filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 6 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const valid = allowed.test(path.extname(file.originalname).toLowerCase());
        if (valid) cb(null, true);
        else cb(new Error('Only images allowed'));
    }
});

// ========== ADMIN ROUTES ==========
router.get('/stats', verifyToken, isAdmin, paymentController.getPaymentStats);
router.get('/debug', verifyToken, isAdmin, paymentController.debugPayments);

// ========== USER ROUTES ==========
router.get('/my-payments', verifyToken, paymentController.getMyPayments);
router.get('/invoice/:paymentId', verifyToken, paymentController.getInvoiceByPaymentId);

// ✅ FIXED: Payment screenshot upload (no auth required for guests)
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