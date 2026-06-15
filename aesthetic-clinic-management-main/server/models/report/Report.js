const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  reportType: { type: String, enum: ['Revenue','Expense','Inventory','Appointments'], required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dateRange: { type: String },
  fileUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);