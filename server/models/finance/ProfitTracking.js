const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfitTrackingSchema = new Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalRevenue: { type: Number },
  totalExpense: { type: Number },
  netProfit: { type: Number },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProfitTracking', ProfitTrackingSchema);