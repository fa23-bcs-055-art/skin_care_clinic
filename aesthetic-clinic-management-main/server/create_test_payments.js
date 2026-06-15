const mongoose = require('mongoose');
const User = require('./models/auth/User');
const Appointment = require('./models/appointment/Appointment');
const Payment = require('./models/finance/Payment');
const Service = require('./models/Service');
const Role = require('./models/auth/Role');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/aesthetic-clinic";

async function createTestData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Get or create Patient role
    let patientRole = await Role.findOne({ roleName: 'Patient' });
    if (!patientRole) {
      patientRole = await Role.create({
        roleName: 'Patient',
        permissions: ['view_dashboard'],
        level: 1
      });
      console.log('⭐ Created Patient role');
    }

    // 2. Create test patient
    let patient = await User.findOne({ email: 'patient@test.com' });
    if (!patient) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      patient = await User.create({
        name: 'Test Patient',
        email: 'patient@test.com',
        password: hashedPassword,
        phone: '03001234567',
        roleId: patientRole._id,
        status: 'active'
      });
      console.log('⭐ Created test patient');
    } else {
      console.log('✅ Test patient already exists');
    }

    // 3. Get a doctor
    let doctor = await User.findOne({ email: 'doctor@example.com' });
    if (!doctor) {
      const docRole = await Role.findOne({ roleName: 'Doctor' });
      const hashedPassword = await bcrypt.hash('123456', 10);
      doctor = await User.create({
        name: 'Dr. Test',
        email: 'doctor@example.com',
        password: hashedPassword,
        phone: '03001111111',
        roleId: docRole._id,
        status: 'active'
      });
      console.log('⭐ Created test doctor');
    }

    // 4. Get a service
    let service = await Service.findOne();
    if (!service) {
      service = await Service.create({
        name: 'Test Service',
        description: 'Test aesthetic service',
        price: 5000
      });
      console.log('⭐ Created test service');
    }

    // 5. Create test appointment
    let appointment = await Appointment.findOne({ patientId: patient._id });
    if (!appointment) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      appointment = await Appointment.create({
        patientId: patient._id,
        doctorId: doctor._id,
        serviceId: service._id,
        appointmentDate: tomorrow,
        timeSlot: '10:00 AM',
        status: 'confirmed',
        consultationFee: 5000
      });
      console.log('⭐ Created test appointment');
    }

    // 6. Create test payments with different dates
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Today at noon

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(14, 30, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(10, 0, 0, 0);

    // Check if today's payment exists
    let todayPayment = await Payment.findOne({
      patientId: patient._id,
      paymentDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()), $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) },
      status: 'Approved'
    });

    if (!todayPayment) {
      await Payment.create({
        patientId: patient._id,
        appointmentId: appointment._id,
        amount: 5000,
        paymentMethod: 'Card',
        transactionId: `TXN-${Date.now()}-1`,
        status: 'Approved',
        paymentDate: today,
        approvedAt: today,
        notes: 'Test payment - Today'
      });
      console.log('⭐ Created payment for today (5000 PKR)');
    }

    // Create yesterday's payment (should NOT count for today)
    let yesterdayPayment = await Payment.findOne({
      patientId: patient._id,
      paymentDate: { $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()), $lt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1) },
      status: 'Approved'
    });

    if (!yesterdayPayment) {
      await Payment.create({
        patientId: patient._id,
        appointmentId: appointment._id,
        amount: 3000,
        paymentMethod: 'Cash',
        transactionId: `TXN-${Date.now()}-2`,
        status: 'Approved',
        paymentDate: yesterday,
        approvedAt: yesterday,
        notes: 'Test payment - Yesterday'
      });
      console.log('⭐ Created payment for yesterday (3000 PKR)');
    }

    // Create last month's payment (should NOT count for this month)
    let lastMonthPayment = await Payment.findOne({
      patientId: patient._id,
      paymentDate: { $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1), $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1) },
      status: 'Approved'
    });

    if (!lastMonthPayment) {
      await Payment.create({
        patientId: patient._id,
        appointmentId: appointment._id,
        amount: 2000,
        paymentMethod: 'JazzCash',
        transactionId: `TXN-${Date.now()}-3`,
        status: 'Approved',
        paymentDate: lastMonth,
        approvedAt: lastMonth,
        notes: 'Test payment - Last month'
      });
      console.log('⭐ Created payment for last month (2000 PKR)');
    }

    // 7. Create a this-month payment (not today)
    const thisMonth = new Date();
    thisMonth.setDate(1); // First day of this month
    thisMonth.setHours(10, 0, 0, 0);

    let thisMonthPayment = await Payment.findOne({
      patientId: patient._id,
      paymentDate: { $gte: thisMonth, $lt: today },
      status: 'Approved'
    });

    if (!thisMonthPayment) {
      await Payment.create({
        patientId: patient._id,
        appointmentId: appointment._id,
        amount: 4000,
        paymentMethod: 'Bank Transfer',
        transactionId: `TXN-${Date.now()}-4`,
        status: 'Approved',
        paymentDate: thisMonth,
        approvedAt: thisMonth,
        notes: 'Test payment - This month (early)'
      });
      console.log('⭐ Created payment for this month (4000 PKR)');
    }

    // 8. Verify the payments
    console.log('\n✅ Test data created successfully!');
    console.log('\n📊 Payment Statistics:');

    const allPayments = await Payment.find({ status: 'Approved' });
    console.log(`  Total approved payments: ${allPayments.length}`);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPmts = await Payment.find({
      status: 'Approved',
      paymentDate: { $gte: todayStart, $lte: todayEnd }
    });
    const todayTotal = todayPmts.reduce((sum, p) => sum + p.amount, 0);
    console.log(`  Today's payments: ${todayPmts.length} (Total: ${todayTotal} PKR)`);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date();
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(1);
    monthEnd.setHours(0, 0, 0, 0);

    const monthPmts = await Payment.find({
      status: 'Approved',
      paymentDate: { $gte: monthStart, $lt: monthEnd }
    });
    const monthTotal = monthPmts.reduce((sum, p) => sum + p.amount, 0);
    console.log(`  This month's payments: ${monthPmts.length} (Total: ${monthTotal} PKR)`);

    console.log('\n🚀 Now refresh your Finance Dashboard to see the revenue!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTestData();
