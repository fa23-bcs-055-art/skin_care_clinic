const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');  // ✅ import verifyToken

// ========== SPECIFIC ROUTES ==========
router.get('/available-slots', appointmentController.getAvailableSlots);
router.get('/my-appointments', verifyToken, appointmentController.getMyAppointments);  // ✅ use verifyToken, not protect
router.get('/', appointmentController.getAllAppointments);

// ========== PARAMETER ROUTES ==========
router.post('/', appointmentController.createAppointment);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
router.put('/:id/status', appointmentController.updateStatus);
router.put('/:id/payment-status', appointmentController.updatePaymentStatus);

module.exports = router;