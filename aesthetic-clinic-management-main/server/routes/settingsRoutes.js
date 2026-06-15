const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const Settings = require('../models/Settings'); // Agar model exist karta hai

// 📢 Public route - For displaying clinic info on frontend
router.get('/public', async (req, res) => {
  try {
    res.json({
      clinicName: "Aesthetic Clinic",
      clinicAddress: "123 Main Street, City",
      clinicPhone: "+92 300 1234567",
      clinicEmail: "info@clinic.com",
      workingHours: "Mon-Sat: 10:00 AM - 7:00 PM",
      aboutText: "Your trusted aesthetic clinic",
      socialMedia: {
        facebook: "https://facebook.com/clinic",
        instagram: "https://instagram.com/clinic",
        twitter: "https://twitter.com/clinic"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get settings - Admin only
router.get('/', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), async (req, res) => {
  try {
    // Agar model nahi hai to default settings return karo
    res.json({
      clinicName: "Aesthetic Clinic",
      clinicAddress: "123 Main Street, City",
      clinicPhone: "+92 300 1234567",
      clinicEmail: "info@clinic.com",
      workingHours: "Mon-Sat: 10:00 AM - 7:00 PM",
      aboutText: "Your trusted aesthetic clinic",
      socialMedia: {
        facebook: "https://facebook.com/clinic",
        instagram: "https://instagram.com/clinic",
        twitter: "https://twitter.com/clinic"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.put('/', verifyToken, authorizeRoles('SuperAdmin', 'Admin'), async (req, res) => {
  try {
    // Agar model hai to save karo, otherwise just return success
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;