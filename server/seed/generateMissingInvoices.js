// Run with: node scripts/generateMissingInvoices.js
const mongoose = require('mongoose');
const Payment = require('../models/finance/Payment');
const Invoice = require('../models/finance/Invoice');

async function generateMissingInvoices() {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-db-name');
    
    const approvedPayments = await Payment.find({ status: 'Approved' });
    console.log(`Found ${approvedPayments.length} approved payments`);
    
    let generated = 0;
    let skipped = 0;
    
    for (const payment of approvedPayments) {
      const existingInvoice = await Invoice.findOne({ paymentId: payment._id });
      
      if (!existingInvoice) {
        const invoice = await Invoice.create({
          patientId: payment.patientId,
          paymentId: payment._id,
          items: [{
            description: `Payment via ${payment.paymentMethod}`,
            quantity: 1,
            unitPrice: payment.amount,
            total: payment.amount
          }],
          subtotal: payment.amount,
          total: payment.amount,
          status: 'Paid',
          paidDate: payment.paymentDate || new Date()
        });
        console.log(`✅ Generated invoice ${invoice.invoiceNumber} for payment ${payment._id}`);
        generated++;
      } else {
        console.log(`⏭️ Invoice already exists for payment ${payment._id}`);
        skipped++;
      }
    }
    
    console.log(`\n📊 Summary: ${generated} invoices generated, ${skipped} skipped`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateMissingInvoices();