const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RevenueSchema = new Schema({
  source: { type: String, enum: ['Treatment','Package','Product'], required: true },
  referenceId: { type: Schema.Types.ObjectId },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Revenue', RevenueSchema);