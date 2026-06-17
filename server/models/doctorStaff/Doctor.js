const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DoctorSchema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  experienceYears: { type: Number },
  qualification: { type: String },
  contact: { type: String },
  commissionPercentage: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);