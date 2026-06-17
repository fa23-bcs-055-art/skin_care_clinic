const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Card', 'JazzCash', 'Easypaisa', 'EasyPaisa', 'Bank Transfer', 'UPI', 'Insurance'], 
    default: 'Cash' 
  },
  transactionId: { type: String },
  screenshot: { type: String }, 
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Success', 'Failed', 'Refunded'], 
    default: 'Pending' 
  },
  paymentDate: { type: Date, default: Date.now },
  approvedAt: { type: Date }, 
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);