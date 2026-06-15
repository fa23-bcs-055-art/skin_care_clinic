const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  // Basic Info (from User)
  name: { type: String, required: true },
  phone: { type: String },
  
  // Link to User account (optional for existing patients)
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Medical Info
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String },
  bloodGroup: { type: String },
  medicalHistory: { type: String },
  allergies: { type: String },
  
  // Email (optional)
  email: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);