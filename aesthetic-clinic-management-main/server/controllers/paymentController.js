const Payment = require('../models/finance/Payment');
const Appointment = require('../models/appointment/Appointment');
const User = require('../models/auth/User');
const { bufferToDataUri, validateImage } = require('../services/imageService');

// ========== UPLOAD SCREENSHOT (Base64) ==========
exports.uploadScreenshot = async (req, res) => {
  try {
    console.log('📸 Screenshot upload request received');
    console.log('📁 req.file:', req.file);

    if (!req.file) {
      return res.status(400).json({ error: 'No screenshot file uploaded' });
    }

    // Validate (size, mime)
    validateImage(req.file);

    // Convert to full data URI
    const dataUri = bufferToDataUri(req.file.buffer, req.file.mimetype);

    console.log('✅ GENERATED DATA URI LENGTH:', dataUri.length);

    // Return the Base64 data URI to frontend
    res.json({
      success: true,
      screenshot: dataUri  // field name matches what frontend expects
    });
  } catch (error) {
    console.error('❌ Screenshot upload error:', error);
    res.status(400).json({ error: error.message });
  }
};

// ========== CREATE PAYMENT ==========
exports.createPayment = async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      amount,
      paymentMethod,
      transactionId,
      screenshot,
      status = 'Pending',
      notes
    } = req.body;

    console.log('💰 Payment create body:', req.body);

    // Validate required fields
    if (!patientId || !amount) {
      return res.status(400).json({ error: 'Patient ID and amount are required' });
    }

    // For non-Cash, require screenshot and transactionId
    if (paymentMethod !== 'Cash') {
      if (!screenshot) {
        return res.status(400).json({ error: 'Payment screenshot is required for non-cash payments' });
      }
      if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID is required for non-cash payments' });
      }
    }

    const payment = new Payment({
      patientId,
      appointmentId,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      transactionId: transactionId || (paymentMethod === 'Cash' ? 'CASH' : ''),
      screenshot: screenshot || null, // store Base64 if provided
      status,
      notes
    });

    await payment.save();

    console.log('✅ Payment saved with screenshot:', payment.screenshot ? 'present' : 'null');

    // Update appointment payment status if linked
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: 'Pending'
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('❌ Payment creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== GET ALL PAYMENTS (with population) ==========
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('patientId', 'name email phone')
      .populate('appointmentId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== GET MY PAYMENTS ==========
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const payments = await Payment.find({ patientId: userId })
      .populate('appointmentId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== GET INVOICE BY PAYMENT ID ==========
exports.getInvoiceByPaymentId = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('patientId', 'name email phone')
      .populate('appointmentId');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== APPROVE PAYMENT ==========
exports.approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedAt: new Date() },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    // Update appointment payment status
    if (payment.appointmentId) {
      await Appointment.findByIdAndUpdate(payment.appointmentId, {
        paymentStatus: 'Paid'
      });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== REJECT PAYMENT ==========
exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== GET PAYMENT BY ID ==========
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('appointmentId');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== UPDATE PAYMENT ==========
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== DELETE PAYMENT ==========
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== GET PAYMENT STATS ==========
exports.getPaymentStats = async (req, res) => {
  try {
    const total = await Payment.countDocuments();
    const pending = await Payment.countDocuments({ status: 'Pending' });
    const approved = await Payment.countDocuments({ status: 'Approved' });
    const rejected = await Payment.countDocuments({ status: 'Rejected' });
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== DEBUG PAYMENTS ==========
exports.debugPayments = async (req, res) => {
  try {
    const payments = await Payment.find().limit(10);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};