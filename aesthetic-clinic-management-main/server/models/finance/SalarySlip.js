const mongoose = require('mongoose');

const SalarySlipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    default: 0
  },
  totalAllowances: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true,
    default: 0
  },
  allowanceDetails: [{
    name: String,
    amount: Number
  }],
  deductionDetails: [{
    name: String,
    amount: Number
  }],
  status: {
    type: String,
    enum: ['Draft', 'Approved', 'Paid'],
    default: 'Draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  paymentDate: Date
}, { timestamps: true });

SalarySlipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('SalarySlip', SalarySlipSchema);