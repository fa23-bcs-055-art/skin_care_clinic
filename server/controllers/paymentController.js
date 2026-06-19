const Payment = require('../models/finance/Payment');
const Appointment = require('../models/appointment/Appointment');
const Invoice = require('../models/finance/Invoice');

// ✅ FIXED: Helper to generate invoice
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
      .populate('patientId', 'name email phone') 
      .populate('appointmentId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

exports.createPayment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { appointmentId, amount, paymentMethod, notes } = req.body;
    const payment = await Payment.create({
      patientId: userId,
      appointmentId: appointmentId || null,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      transactionId: `TXN-${Date.now()}`,
      status: 'Pending',
      notes
    });
    res.status(201).json(payment);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// ✅ FIXED: Approve payment and generate invoice
exports.approvePayment = async (req, res) => {
  try {
    console.log("✅ Approving payment:", req.params.id);
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedAt: new Date(), paymentDate: new Date() },
      { new: true }
    ).populate('appointmentId').populate('patientId');
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    // ✅ Generate invoice automatically
    const invoice = await generateInvoice(payment, payment.appointmentId);
    
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
    const payment = await Payment.findById(req.params.id).populate('patientId appointmentId');
    if (!payment) return res.status(404).json({ error: "Not found" });
    res.json(payment);
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
    const payments = await Payment.find({ patientId: userId })
      .populate('appointmentId')
      .sort({ createdAt: -1 });
    res.json(payments);
const Payment = require('../models/finance/Payment');
const Appointment = require('../models/appointment/Appointment');
const Invoice = require('../models/finance/Invoice');

// ✅ FIXED: Helper to generate invoice
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
      .populate('patientId', 'name email phone') 
      .populate('appointmentId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

exports.createPayment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { appointmentId, amount, paymentMethod, notes } = req.body;
    const payment = await Payment.create({
      patientId: userId,
      appointmentId: appointmentId || null,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      transactionId: `TXN-${Date.now()}`,
      status: 'Pending',
      notes
    });
    res.status(201).json(payment);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// ✅ FIXED: Approve payment and generate invoice
exports.approvePayment = async (req, res) => {
  try {
    console.log("✅ Approving payment:", req.params.id);
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedAt: new Date(), paymentDate: new Date() },
      { new: true }
    ).populate('appointmentId').populate('patientId');
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    // ✅ Generate invoice automatically
    const invoice = await generateInvoice(payment, payment.appointmentId);
    
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
    const payment = await Payment.findById(req.params.id).populate('patientId appointmentId');
    if (!payment) return res.status(404).json({ error: "Not found" });
    res.json(payment);
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
    const payments = await Payment.find({ patientId: userId })
      .populate('appointmentId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

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
  // Require a paymentId to associate the screenshot
  const { paymentId } = req.body;
  if (!paymentId) {
    console.warn('⚠️ paymentId missing for screenshot upload');
    return res.status(400).json({ error: 'paymentId is required' });
  }

  // Verify payment exists and is not a cash payment
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    console.warn('⚠️ Payment not found for screenshot upload');
    return res.status(404).json({ error: 'Payment not found' });
  }
  if (payment.paymentMethod === 'Cash') {
    console.warn('⚠️ Attempt to upload screenshot for cash payment');
    return res.status(400).json({ error: 'Cash payments do not require a screenshot' });
  }

  if (!req.file) {
    console.warn('⚠️ No screenshot file provided');
    return res.status(400).json({ error: 'No screenshot file provided' });
  }
  // Store filename in payment record
  payment.screenshot = req.file.filename;
  await payment.save();
  // If this payment is linked to an appointment, mark the appointment as paid
  if (payment.appointmentId) {
    const Appointment = require('../models/appointment/Appointment');
    await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'Paid' });
  }
  console.log('✅ Screenshot uploaded and linked to payment:', req.file.filename);
};

exports.debugPayments = async (req, res) => {
  const payments = await Payment.find().limit(3);
  res.json(payments);
};
