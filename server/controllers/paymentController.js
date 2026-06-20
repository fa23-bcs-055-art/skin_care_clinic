const express = require('express');
const router = express.Router();
const multer = require('multer');
const paymentController = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ✅ Use memory storage (no filesystem)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, WEBP images allowed'), false);
    }
  }
});

// Debug check
if (!paymentController.getPaymentStats) {
  console.error("❌ ERROR: getPaymentStats is missing in paymentController!");
}

// ========== ADMIN ROUTES ==========
router.get('/stats', verifyToken, isAdmin, paymentController.getPaymentStats);
router.get('/debug', verifyToken, isAdmin, paymentController.debugPayments);

// ========== USER ROUTES ==========
router.get('/my-payments', verifyToken, paymentController.getMyPayments);
router.get('/invoice/:paymentId', verifyToken, paymentController.getInvoiceByPaymentId);

// ✅ Upload screenshot – returns Base64 data URI
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