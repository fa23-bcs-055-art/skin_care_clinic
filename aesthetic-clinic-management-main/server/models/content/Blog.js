const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  excerpt: {
    type: String,
    maxlength: 200
  },
  image: {
    type: String,
    default: '/default-blog.jpg'
  },
  author: {
    type: String,
    default: 'Admin'
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['Skincare', 'Treatments', 'News', 'Tips', 'General'],
    default: 'General'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);