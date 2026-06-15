const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    type: String,
    required: true
  },
  beforeImage: String,  // For before/after pairs
  afterImage: String,   // For before/after pairs
  category: {
    type: String,
    enum: ['Clinic', 'Treatments', 'Before-After', 'Events', 'Team', 'Facilities'],
    default: 'Clinic'
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    size: Number,
    format: String,
    dimensions: {
      width: Number,
      height: Number
    }
  }
}, {
  timestamps: true
});

// Index for sorting and filtering
gallerySchema.index({ category: 1, order: 1 });
gallerySchema.index({ isActive: 1, isFeatured: 1 });
gallerySchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);