const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  clinicName: { type: String, default: 'Skincare Clinic' },
  clinicAddress: String,
  clinicPhone: String,
  clinicEmail: String,
  workingHours: String,
  aboutText: String,
  logo: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  stats: {
    yearsExperience: { type: Number, default: 10 },
    satisfactionRate: { type: Number, default: 98 },
    totalPatients: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);