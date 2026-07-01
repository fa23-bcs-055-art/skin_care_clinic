const Payment = require('../models/finance/Payment');
const Appointment = require('../models/appointment/Appointment');
const Invoice = require('../models/finance/Invoice');
const Patient = require('../models/patient/Patient');
const User = require('../models/auth/User');

// Helper: Resolve a user ID to a Patient document ID
// If the ID belongs to a User (not a Patient), find or create the corresponding Patient document
const resolveToPatientId = async (id, isAdmin = false) => {
  if (!id) return null;
  // Direct Patient lookup
  const directPatient = await Patient.findById(id);
  if (directPatient) return directPatient._id;

  // Linked Patient via userId
  const linkedPatient = await Patient.findOne({ userId: id });
  if (linkedPatient) return linkedPatient._id;

  // Auto-create Patient only for non-admin users
  if (!isAdmin) {
    const user = await User.findById(id);
    if (user) {
      const newPatient = await Patient.create({
        userId: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email
      });
      return newPatient._id;
    }
  }

  return id; // fallback
};

// Helper: Enrich a payment's patientId with populated details from Patient collection
const enrichPaymentPatient = async (payment) => {
  const paymentObj = payment.toObject ? payment.toObject() : { ...payment };
  
  if (!paymentObj.patientId) return paymentObj;

  // Try to populate from Patient collection
  const patient = await Patient.findById(paymentObj.patientId).lean();
  if (patient) {
    paymentObj.patientId = patient;
    return paymentObj;
  }

  // Fallback: maybe stored as User ID
  const user = await User.findById(paymentObj.patientId).select('name email phone').lean();
  if (user) {
    paymentObj.patientId = { _id: user._id, name: user.name, email: user.email, phone: user.phone };
  }

  return paymentObj;
};

// Helper to generate invoice
const generateInvoice = async (payment, appointment = null) => {
  try {
    console.log("📄 Generating invoice for payment:", payment._id);

    const invoiceData = {
      patientId: payment.patientId,
      paymentId: payment._id,
      items: [{
        description: appointment ? `Consultation Fee - ${new Date(appointment.appointmentDate).toLocaleDateString()}` : `Payment via ${payment.paymentMethod}`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      tax: 0,
      discount: 0,
      total: payment.amount,
      status: 'Paid',
      paidDate: new Date()
    };

    const invoice = await Invoice.create(invoiceData);
    console.log(`✅ Invoice generated: ${invoice.invoiceNumber} for payment: ${payment._id}`);
    return invoice;
  } catch (error) {
    console.error('❌ Invoice generation error:', error.message);
    return null;
  }
};

// --- API Handlers ---

exports.getPaymentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const approved = await Payment.find({ status: { $in: ['Approved', 'Success'] } });
    const totalRevenue = approved.reduce((sum, p) => sum + (p.amount || 0), 0);

    const todayPayments = await Payment.find({ status: { $in: ['Approved', 'Success'] }, paymentDate: { $gte: today, $lt: tomorrow } });
    const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const monthPayments = await Payment.find({ status: { $in: ['Approved', 'Success'] }, paymentDate: { $gte: startOfMonth, $lte: endOfMonth } });
    const monthlyRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const pending = await Payment.find({ status: 'Pending' });
    const pendingAmount = pending.reduce((sum, p) => sum + (p.amount || 0), 0);
    const methodBreakdown = {};
    approved.forEach(p => { methodBreakdown[p.paymentMethod] = (methodBreakdown[p.paymentMethod] || 0) + p.amount; });

    res.json({
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      pendingAmount,
      totalTransactions: await Payment.countDocuments(),
      successfulTransactions: approved.length,
      methodBreakdown
    });
  } catch (error) {
    console.error('Payment stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'appointmentId',
        populate: { path: 'serviceId', select: 'name price' }
      })
      .populate('serviceId', 'name price')
      .sort({ createdAt: -1 });

    // Manually enrich patientId from Patient (or User) collection
    const enriched = await Promise.all(payments.map(enrichPaymentPatient));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    console.log("Payment Request Body:", req.body);
    console.log("Screenshot Received:", req.body.screenshot);

    const isAdmin = req.user?.role && ['SuperAdmin', 'Admin'].includes(req.user.role);
    // Admin must provide a valid patientId that is not their own user ID
    if (isAdmin) {
      if (!req.body.patientId) {
        return res.status(400).json({ error: 'Patient ID is required for admin payment creation.' });
      }
      if (req.body.patientId === req.user.id) {
        return res.status(400).json({ error: 'Admin cannot record a payment for themselves.' });
      }
    }
    let patientId;

    if (isAdmin && req.body.patientId) {
      // Admin created payment: resolve the provided patientId to a Patient doc
      patientId = await resolveToPatientId(req.body.patientId, true);
    } else {
      // User created payment: resolve logged-in user to Patient doc
      patientId = await resolveToPatientId(req.user?.id || req.user?._id);
    }

    const { appointmentId, serviceId, amount, paymentMethod, notes, transactionId, screenshot, status } = req.body;
    const payment = await Payment.create({
      patientId,
      appointmentId: appointmentId || null,
      serviceId: serviceId || null,
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || 'Cash',
      transactionId: transactionId || `TXN-${Date.now()}`,
      screenshot: screenshot || '',
      status: status || 'Pending',
      notes
    });

    if (appointmentId && screenshot) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentScreenshot: screenshot
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error("❌ Create payment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Approve payment and generate invoice
exports.approvePayment = async (req, res) => {
  try {
    console.log("✅ Approving payment:", req.params.id);

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedAt: new Date(), paymentDate: new Date() },
      { new: true }
    ).populate({
      path: 'appointmentId',
      populate: { path: 'serviceId', select: 'name price' }
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Generate invoice automatically
    const invoice = await generateInvoice(payment, payment.appointmentId);

    // Mark appointment as Paid if non-cash
    if (payment.paymentMethod && payment.paymentMethod !== 'Cash' && payment.appointmentId) {
      try {
        await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'Paid' });
        console.log('✅ Appointment paymentStatus set to Paid for appointment:', payment.appointmentId);
      } catch (err) {
        console.error('⚠️ Failed to update appointment payment status:', err);
      }
    }

    if (!invoice) {
      console.warn("⚠️ Invoice generation failed but payment approved");
      return res.json({ success: true, payment, invoice: null });
    }

    console.log("✅ Payment approved and invoice generated");
    res.json({ success: true, payment, invoice });

  } catch (error) {
    console.error("❌ Approve payment error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', notes: req.body.rejectionReason },
      { new: true }
    );
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'appointmentId',
        populate: { path: 'serviceId', select: 'name price' }
      });
    if (!payment) return res.status(404).json({ error: "Not found" });
    const enriched = await enrichPaymentPatient(payment);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    // Resolve user to Patient doc
    const patient = await Patient.findOne({ userId });
    const patientIds = patient ? [patient._id] : [];

    // Query by Patient doc ID (and also fallback to userId in case legacy data exists)
    const query = patientIds.length > 0
      ? { $or: [{ patientId: { $in: patientIds } }, { patientId: userId }] }
      : { patientId: userId };

    const payments = await Payment.find(query)
      .populate({
        path: 'appointmentId',
        populate: { path: 'serviceId', select: 'name price' }
      })
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(payments.map(enrichPaymentPatient));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get invoice by payment ID with better error handling
exports.getInvoiceByPaymentId = async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log("🔍 Looking for invoice with paymentId:", paymentId);

    const invoice = await Invoice.findOne({ paymentId: paymentId })
      .populate('patientId', 'name email phone');

    if (!invoice) {
      console.log("❌ No invoice found for paymentId:", paymentId);
      return res.status(404).json({ error: "Invoice not found for this payment" });
    }

    console.log("✅ Invoice found:", invoice.invoiceNumber);
    res.json(invoice);

  } catch (error) {
    console.error("❌ Get invoice error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No screenshot file uploaded' });
    }
    const b64 = req.file.buffer.toString('base64');
    const screenshotData = `data:${req.file.mimetype};base64,${b64}`;

    res.json({
      success: true,
      screenshotUrl: screenshotData,
      uploadedUrl: screenshotData
    });
  } catch (error) {
    console.error("❌ Upload screenshot error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.debugPayments = async (req, res) => {
  const payments = await Payment.find().limit(3);
  res.json(payments);
};