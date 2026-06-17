const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Role = require('../models/auth/Role');
const User = require('../models/auth/User');
const Patient = require('../models/patient/Patient');
const Treatment = require('../models/treatment/Treatment');
const TreatmentCategory = require('../models/treatment/TreatmentCategory');
const Appointment = require('../models/appointment/Appointment');
const Doctor = require('../models/doctorStaff/Doctor');
const Supplier = require('../models/inventory/Supplier');
const Inventory = require('../models/inventory/Inventory');

router.post('/', async (req, res) => {
  try {
    let superRole = await Role.findOne({ roleName: 'SuperAdmin' });
    if (!superRole) {
      superRole = await Role.create({ roleName: 'SuperAdmin', permissions: ['all'] });
    }

    let superAdminUser = await User.findOne({ email: 'laibasagheer10@gmail.com' });
    if (!superAdminUser) {
      superAdminUser = await User.create({
        name: 'Laiba Sagheer',
        email: 'laibasagheer10@gmail.com',
        password: await bcrypt.hash('123456', 10),
        phone: '03463921285',
        roleId: superRole._id
      });
    }

    let adminRole = await Role.findOne({ roleName: 'Admin' });
    if (!adminRole) {
      adminRole = await Role.create({ roleName: 'Admin', permissions: ['manage_patients', 'manage_appointments', 'manage_inventory'] });
    }

    let adminUser = await User.findOne({ email: 'muneebch185185@gmail.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Muneeb',
        email: 'muneebch185185@gmail.com',
        password: await bcrypt.hash('123456', 10),
        phone: '03007654321',
        roleId: adminRole._id
      });
    }

    const patient = await Patient.create({
      userId: adminUser._id,
      dateOfBirth: new Date('1995-05-05'),
      gender: 'Female',
      address: '123 Test Street',
      bloodGroup: 'B+',
      medicalHistory: 'None',
      allergies: 'None'
    });

    const treatmentCategory = await TreatmentCategory.findOne({ categoryName: 'Skin' }) || await TreatmentCategory.create({ categoryName: 'Skin', description: 'Skin related treatments' });

    const treatment = await Treatment.create({
      name: 'Facial Cleanse',
      categoryId: treatmentCategory._id,
      description: 'Basic facial treatment',
      cost: 5000
    });

    // Ensure a test doctor exists and use its id for the appointment
    let doctor = await Doctor.findOne({ email: 'testdoctor@example.com' });
    if (!doctor) {
      doctor = await Doctor.create({
        name: 'Test Doctor',
        email: 'testdoctor@example.com',
        phone: '03001234567',
        specialization: 'Dermatologist'
      });
    }

    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      treatmentId: treatment._id,
      appointmentDate: new Date(),
      appointmentTime: '10:00 AM',
      status: 'Pending',
      paymentStatus: 'Unpaid',
      notes: 'Test appointment'
    });

    const supplier = await Supplier.create({
      supplierName: 'Test Supplier',
      contact: '03005556677',
      company: '',
      address: '456 Supplier Street'
    });

    await Inventory.create({
      productName: 'Vitamin C Serum',
      category: 'Skin',
      stockQuantity: 50,
      purchasePrice: 1200,
      sellingPrice: 1500,
      supplierId: supplier._id,
      lowStockAlert: 5
    });

    res.json({ message: '✅ Test data inserted successfully! Check MongoDB Compass for collections & documents.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;