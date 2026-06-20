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

const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(require('path').extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter });

// ========== ADMIN ROUTES ==========
router.get('/stats', verifyToken, isAdmin, paymentController.getPaymentStats);
router.get('/debug', verifyToken, isAdmin, paymentController.debugPayments);

// ========== USER ROUTES ==========
router.get('/my-payments', verifyToken, paymentController.getMyPayments);
router.get('/invoice/:paymentId', verifyToken, paymentController.getInvoiceByPaymentId);

// Use multer memory storage middleware to accept Base64 screenshot file
router.post('/upload-screenshot', verifyToken, upload.single('screenshot'), paymentController.uploadScreenshot);

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
