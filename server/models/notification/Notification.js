const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Appointment', 'Payment', 'Reminder', 'LowStock', 'Alert'], 
    required: true 
  },
  title: {
    type: String,
    required: true
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  data: {
    type: Schema.Types.Mixed, // For storing additional data like appointmentId, paymentId etc.
    default: {}
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  }
}, { 
  timestamps: true 
});

// Index for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);