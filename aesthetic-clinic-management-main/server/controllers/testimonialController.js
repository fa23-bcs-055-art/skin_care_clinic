const Testimonial = require('../models/content/Testimonial');

// ✅ PUBLIC - Submit testimonial (no auth required)
exports.submitTestimonial = async (req, res) => {
  try {
    // Save as inactive (pending approval)
    const testimonial = await Testimonial.create({
      ...req.body,
      isActive: false  // Pending approval
    });
    res.status(201).json({ message: 'Testimonial submitted successfully' });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUBLIC - Get approved testimonials
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort('-createdAt')
      .limit(20);
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Get all testimonials (for management)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort('-createdAt');
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Update testimonial (approve/reject/edit)
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Toggle testimonial status (approve/reject)
exports.toggleStatus = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    
    res.json({ 
      message: `Testimonial ${testimonial.isActive ? 'approved' : 'rejected'}`,
      isActive: testimonial.isActive 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};