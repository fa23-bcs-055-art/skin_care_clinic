const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: [
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'ACTIVATE_USER', 'DEACTIVATE_USER',
      'CREATE_PATIENT', 'UPDATE_PATIENT', 'DELETE_PATIENT',
      'CREATE_APPOINTMENT', 'UPDATE_APPOINTMENT', 'DELETE_APPOINTMENT',
      'CREATE_PAYMENT', 'UPDATE_PAYMENT', 'DELETE_PAYMENT',
      'CREATE_EXPENSE', 'UPDATE_EXPENSE', 'DELETE_EXPENSE',
      'CREATE_INVENTORY', 'UPDATE_INVENTORY', 'DELETE_INVENTORY',
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
      'EXPORT_DATA', 'VIEW_REPORT', 'UPDATE_SETTINGS'
    ],
    required: true
  },
  target: {
    type: Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['User', 'Patient', 'Appointment', 'Payment', 'Expense', 'Inventory', 'Role']
  },
  details: Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  }
}, { timestamps: true });

// Index for faster queries
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);