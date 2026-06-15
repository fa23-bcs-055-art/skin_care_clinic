const express = require('express');
const router = express.Router();
const Invoice = require('../models/finance/Invoice');
const Payment = require('../models/finance/Payment');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ========== ADMIN ROUTES (SPECIFIC - MUST COME FIRST) ==========

// Get all invoices (Admin only)
router.get('/', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patientId', 'name email phone')
      .populate('paymentId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    res.status(500).json({ error: error.message });
  }
});

// Download invoice PDF (Admin only)
router.get('/:id/download', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patientId', 'name email phone');
    
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Clinic Info
    doc.fontSize(10).text('Aesthetics by Dr. Hira Iftikhar', { align: 'center' });
    doc.text('123 Healthcare Street, Lahore', { align: 'center' });
    doc.text('Phone: +92 300 1234567', { align: 'center' });
    doc.moveDown();
    
    // Invoice Details
    doc.fontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon Receipt'}`);
    doc.text(`Patient: ${invoice.patientId?.name || 'N/A'}`);
    doc.text(`Phone: ${invoice.patientId?.phone || 'N/A'}`);
    doc.moveDown();
    
    // Separator
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Table Header
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, doc.y);
    doc.text('Qty', 300, doc.y);
    doc.text('Price', 400, doc.y);
    doc.text('Total', 500, doc.y);
    doc.moveDown();
    doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Table Rows
    doc.font('Helvetica');
    invoice.items.forEach(item => {
      doc.text(item.description, 50, doc.y);
      doc.text(item.quantity.toString(), 300, doc.y);
      doc.text(`₨${item.unitPrice.toLocaleString()}`, 400, doc.y);
      doc.text(`₨${item.total.toLocaleString()}`, 500, doc.y);
      doc.moveDown();
    });
    
    doc.moveDown();
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Totals
    const totalsX = 350;
    doc.text(`Subtotal:`, totalsX, doc.y);
    doc.text(`₨${invoice.subtotal.toLocaleString()}`, 500, doc.y);
    doc.moveDown();
    
    if (invoice.tax > 0) {
      doc.text(`Tax (${invoice.taxRate || 0}%):`, totalsX, doc.y);
      doc.text(`₨${invoice.tax.toLocaleString()}`, 500, doc.y);
      doc.moveDown();
    }
    
    if (invoice.discount > 0) {
      doc.text(`Discount:`, totalsX, doc.y);
      doc.text(`-₨${invoice.discount.toLocaleString()}`, 500, doc.y);
      doc.moveDown();
    }
    
    doc.font('Helvetica-Bold');
    doc.text(`Total Amount:`, totalsX, doc.y);
    doc.text(`₨${invoice.total.toLocaleString()}`, 500, doc.y);
    doc.moveDown(2);
    
    // Status
    doc.font('Helvetica');
    doc.text(`Status: ${invoice.status}`, { align: 'center' });
    
    if (invoice.status === 'Paid') {
      doc.text(`Paid on: ${new Date(invoice.paidDate).toLocaleDateString()}`, { align: 'center' });
    }
    
    doc.moveDown();
    doc.text('Thank you for your business!', { align: 'center', italic: true });
    
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== USER ROUTES (SPECIFIC - MUST COME BEFORE GENERIC /:id) ==========

// Get invoice by payment ID (for users to view their invoice)
// If invoice doesn't exist, automatically generate it from payment
router.get('/payment/:paymentId', verifyToken, async (req, res) => {
  try {
    const paymentIdParam = req.params.paymentId;
    console.log('Fetching/generating invoice for paymentId:', paymentIdParam);

    // Try to find existing invoice
    let invoice = await Invoice.findOne({ paymentId: paymentIdParam })
      .populate('patientId', 'name email phone');

    // If invoice exists, return it
    if (invoice) {
      console.log('Invoice found:', invoice._id);
      return res.json(invoice);
    }

    // If no invoice exists, generate one from payment
    console.log('Invoice not found. Generating from payment...');
    
    const payment = await Payment.findById(paymentIdParam)
      .populate('patientId')
      .populate({
        path: 'appointmentId',
        populate: { path: 'serviceId', select: 'name' }
      });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Get service name from appointment's service
    let serviceName = 'Service';
    if (payment.appointmentId?.serviceId?.name) {
      serviceName = payment.appointmentId.serviceId.name;
    } else if (payment.appointmentId?.serviceName) {
      serviceName = payment.appointmentId.serviceName;
    }

    // Generate invoice from payment
    const newInvoice = await Invoice.create({
      patientId: payment.patientId._id,
      paymentId: payment._id,
      items: [{
        description: `${serviceName} - Appointment on ${new Date(payment.appointmentId?.appointmentDate || payment.paymentDate).toLocaleDateString()}`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      tax: 0,
      discount: 0,
      total: payment.amount,
      status: 'Paid',
      paidDate: payment.paymentDate || Date.now()
    });

    // Populate patient info before returning
    await newInvoice.populate('patientId', 'name email phone');
    
    console.log('Invoice generated successfully:', newInvoice._id);
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Error fetching/generating invoice:", error);
    res.status(500).json({ error: error.message });
  }
});

// ========== GENERIC ROUTES (MUST COME LAST) ==========

// Get invoice by ID (for users)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patientId', 'name email phone');
    
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ error: error.message });
  }
});
// ✅ DEBUG ROUTE - Check all invoices
router.get('/debug/all', verifyToken, authorizeRoles('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patientId', 'name email')
      .populate('paymentId');
    
    console.log("Total invoices:", invoices.length);
    invoices.forEach(inv => {
      console.log(`- ${inv.invoiceNumber} | Payment: ${inv.paymentId} | Patient: ${inv.patientId?.name}`);
    });
    
    res.json({ 
      total: invoices.length, 
      invoices: invoices.map(i => ({
        id: i._id,
        invoiceNumber: i.invoiceNumber,
        paymentId: i.paymentId,
        patientName: i.patientId?.name
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;