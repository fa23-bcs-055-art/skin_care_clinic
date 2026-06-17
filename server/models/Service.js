const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  shortDescription: {
    type: String,
    maxlength: 150
  },
  price: { 
    type: Number, 
    required: true 
  },
  discountedPrice: {
    type: Number
  },
  duration: { 
    type: String,  // e.g., "30 mins", "1 hour"
    required: true 
  },
  icon: {
    type: String,
    default: '✨'
  },
  image: {
    type: String,
    default: '/default-service.jpg'
  },
  category: {
    type: String,
    enum: ['Facial', 'Laser', 'Treatment', 'Consultation', 'Surgery', 'Wellness'],
    default: 'Treatment'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Index for better performance
serviceSchema.index({ isActive: 1, order: 1 });
serviceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);