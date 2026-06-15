const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  roleName: { 
    type: String, 
    required: true,
    enum: ['SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist', 'Accountant', 'Patient'] // Added 'Patient'
  },
  permissions: [{ 
    type: String,
    enum: [
      'view_dashboard',
      'manage_patients',
      'view_patients',
      'manage_appointments',
      'view_appointments',
      'manage_finance',
      'view_finance',
      'manage_inventory',
      'view_inventory',
      'manage_users',
      'view_users',
      'view_reports',
      'export_data',
      'manage_settings'
    ]
  }],
  description: String,
  level: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);