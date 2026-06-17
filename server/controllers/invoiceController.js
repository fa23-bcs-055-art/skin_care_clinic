const Invoice = require('../models/finance/Invoice');
const Payment = require('../models/finance/Payment');
const Appointment = require('../models/appointment/Appointment');
const PDFDocument = require('pdfkit');
const Notification = require('../models/notification/Notification');
const User = require('../models/auth/User');

// Helper to create notification
const createNotification = async (userId, title, message, type, data = {}) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      isRead: false
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patientId', 'name phone email')
      .populate('paymentId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInvoices = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const invoices = await Invoice.find({ patientId: userId })
      .populate('paymentId')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patientId')
      .populate('paymentId');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateInvoiceFromPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('patientId')
      .populate('appointmentId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const invoice = await Invoice.create({
      patientId: payment.patientId._id,
      paymentId: payment._id,
      items: [{
        description: `Appointment on ${new Date(payment.appointmentId?.appointmentDate || Date.now()).toLocaleDateString()}`,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount
      }],
      subtotal: payment.amount,
      total: payment.amount,
      status: 'Paid',
      paidDate: payment.paymentDate || Date.now()
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patientId');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

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
    const statusColor = invoice.status === 'Paid' ? '#4CAF50' : invoice.status === 'Sent' ? '#2196F3' : '#FF9800';
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
};