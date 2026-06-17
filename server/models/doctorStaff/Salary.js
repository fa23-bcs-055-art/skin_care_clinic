const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SalarySchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  month: { type: String },
  basicSalary: { type: Number },
  bonus: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  netSalary: { type: Number },
  paymentDate: { type: Date },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Salary', SalarySchema);