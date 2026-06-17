// server/routes/easypaisaRoutes.js
const express = require('express');
const router = express.Router();
const easypaisaController = require('../controllers/easypaisaController');
const { verifyToken } = require('../middleware/authMiddleware');

// Initialize payment (Requires authentication)
router.post('/initiate', verifyToken, easypaisaController.initiatePayment);

// Simulate payment success (For testing purposes)
router.get('/simulate-success', easypaisaController.simulateSuccess);

// IPN / Callback from Easypaisa (No auth required, server-to-server)
router.post('/callback', easypaisaController.callback);

// Check payment status
router.get('/status/:orderId', verifyToken, easypaisaController.checkPaymentStatus);

module.exports = router;