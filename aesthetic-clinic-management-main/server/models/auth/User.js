const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  profileImage: { type: String },
  
  // 🔥 NEW FIELDS for enhanced security
  department: {
    type: String,
    enum: ['Administration', 'Medical', 'Finance', 'Inventory', 'Reception', null],
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // 📧 NEW FIELDS for password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // 📧 NEW FIELDS for email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, { timestamps: true });

// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', UserSchema);