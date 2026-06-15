const mongoose = require('mongoose');
const Role = require('./models/auth/Role');
const User = require('./models/auth/User');
const Service = require('./models/Service');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://LaibaSagheer:Laiba%40185@ac-qrjw8wb-shard-00-00.negjn77.mongodb.net:27017,ac-qrjw8wb-shard-00-01.negjn77.mongodb.net:27017,ac-qrjw8wb-shard-00-02.negjn77.mongodb.net:27017/?ssl=true&replicaSet=atlas-n80a76-shard-0&authSource=admin&appName=Cluster0";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create Roles
    let doctorRole = await Role.findOne({ roleName: 'Doctor' });
    if (!doctorRole) {
      doctorRole = await Role.create({
        roleName: 'Doctor',
        permissions: ['view_dashboard', 'manage_appointments', 'view_appointments'],
        description: 'Medical staff who performs treatments',
        level: 5
      });
      console.log('⭐ Created Doctor role');
    } else {
      console.log('✅ Doctor role already exists');
    }

    let patientRole = await Role.findOne({ roleName: 'Patient' });
    if (!patientRole) {
      patientRole = await Role.create({
        roleName: 'Patient',
        permissions: ['view_dashboard', 'view_appointments'],
        description: 'Registered patient',
        level: 1
      });
      console.log('⭐ Created Patient role');
    }

    // 2. Create a Test Doctor if none exists
    const existingDoctor = await User.findOne({ email: 'doctor@example.com' });
    if (!existingDoctor) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'Hira',
        email: 'doctor@example.com',
        password: hashedPassword,
        phone: '03001234567',
        roleId: doctorRole._id,
        status: 'active',
        department: 'Medical'
      });
      console.log('⭐ Created Test Doctor: Dr. Hira');
    } else {
      console.log('✅ Doctor Hira already exists');
    }

    // 3. Create Sample Services if none exist
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.create([
        {
          name: 'Hydra Facial',
          description: 'Deep cleansing and hydration for glowing skin.',
          price: 4500,
          duration: '45 mins',
          icon: '💧',
          category: 'Facial',
          isActive: true,
          order: 1
        },
        {
          name: 'Laser Hair Removal',
          description: 'Permanent hair reduction for smooth skin.',
          price: 8000,
          duration: '60 mins',
          icon: '⚡',
          category: 'Laser',
          isActive: true,
          order: 2
        },
        {
          name: 'Acne Treatment',
          description: 'Professional treatment to clear acne and prevent scarring.',
          price: 3500,
          duration: '30 mins',
          icon: '🛡️',
          category: 'Treatment',
          isActive: true,
          order: 3
        }
      ]);
      console.log('⭐ Created 3 sample services');
    } else {
      console.log('✅ Services already exist');
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
