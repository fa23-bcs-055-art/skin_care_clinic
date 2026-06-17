const mongoose = require('mongoose');
const Doctor = require('../models/doctorStaff/Doctor');
require('dotenv').config();

const updateDoctor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing doctor
    await Doctor.deleteMany({});
    console.log('Deleted existing doctors');

    // Create Dr. Hira Iftikhar
    const doctor = await Doctor.create({
      name: 'Dr. Hira Iftikhar',
      specialization: 'Aesthetic Medicine Specialist',
      experienceYears: 10,
      qualification: 'MBBS, MPH, CHPE, Fellowship in Aesthetic Medicine, RMP',
      contact: '0319-4474441',
      commissionPercentage: 0,
      status: 'active'
    });

    console.log('✅ Dr. Hira Iftikhar added successfully:', doctor);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateDoctor();