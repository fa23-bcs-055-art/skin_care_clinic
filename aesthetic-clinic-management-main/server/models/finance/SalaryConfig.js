const mongoose = require('mongoose');

const SalaryConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  basicSalary: {
    type: Number,
    required: true,
    default: 0
  },
  allowances: [{
    name: String,
    amount: Number
  }],
  deductions: [{
    name: String,
    amount: Number
  }],
  bankDetails: {
    bankName: { type: String, default: '' },
    accountTitle: { type: String, default: '' },
    accountNumber: { type: String, default: '' }
  },
  auditTrail: [{
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    changes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('SalaryConfig', SalaryConfigSchema);