const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  patientName: { 
    type: String, 
    required: true 
  },
  patientImage: String,
  text: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: 5 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);