const express = require('express');
const router = express.Router();
const multer = require('multer');
const paymentController = require('../controllers/paymentController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ========== USE MEMORY STORAGE – NO FILESYSTEM ==========
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WEBP images are allowed.'), false);
    }
  }
});

// ========== ROUTES ==========
router.get('/stats', verifyToken, isAdmin, paymentController.getPaymentStats);
router.get('/debug', verifyToken, isAdmin, paymentController.debugPayments);
router.get('/my-payments', verifyToken, paymentController.getMyPayments);
router.get('/invoice/:paymentId', verifyToken, paymentController.getInvoiceByPaymentId);

// ✅ Upload screenshot – now returns Base64 data URI
router.post('/upload-screenshot', upload.single('screenshot'), paymentController.uploadScreenshot);

router.put('/:id/approve', verifyToken, isAdmin, paymentController.approvePayment);
router.put('/:id/reject', verifyToken, isAdmin, paymentController.rejectPayment);
router.post('/', verifyToken, paymentController.createPayment);
router.get('/', verifyToken, isAdmin, paymentController.getAllPayments);
router.get('/:id', verifyToken, paymentController.getPaymentById);
router.put('/:id', verifyToken, isAdmin, paymentController.updatePayment);
router.delete('/:id', verifyToken, isAdmin, paymentController.deletePayment);

module.exports = router;