const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeforeAfterImageSchema = new Schema({
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  patientName: { type: String },
  treatmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Treatment', 
    required: true 
  },
  treatmentName: { type: String },
  beforeImage: { 
    type: String, 
    required: true 
  },
  afterImage: { 
    type: String, 
    required: true 
  },
  description: String,
  isPublished: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Indexes
BeforeAfterImageSchema.index({ patientId: 1 });
BeforeAfterImageSchema.index({ treatmentId: 1 });
BeforeAfterImageSchema.index({ isPublished: 1 });

module.exports = mongoose.model('BeforeAfterImage', BeforeAfterImageSchema);