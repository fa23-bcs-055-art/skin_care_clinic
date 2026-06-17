const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // References User model (actual patients)
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Cancelled'], default: 'Draft' },
  dueDate: Date,
  paidDate: Date,
  notes: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

InvoiceSchema.pre('save', async function() {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);