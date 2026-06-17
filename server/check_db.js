const mongoose = require('mongoose');
const Appointment = require('./models/appointment/Appointment');
const Patient = require('./models/auth/User');
const Payment = require('./models/finance/Payment');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/aesthetic-clinic';

mongoose.connect(mongoURI).then(async () => {
  console.log(`✅ Connected to MongoDB at: ${mongoURI}`);
  
  try {
    const appointmentCount = await Appointment.countDocuments();
    const patientCount = await Patient.countDocuments();
    const paymentCount = await Payment.countDocuments();

    console.log(`\n📊 Database Statistics:`);
    console.log(`  Appointments: ${appointmentCount}`);
    console.log(`  Patients: ${patientCount}`);
    console.log(`  Payments: ${paymentCount}`);

    if (appointmentCount > 0) {
      console.log('\n📋 Sample appointments:');
      const appts = await Appointment.find().limit(3);
      appts.forEach(a => {
        console.log(`  ID: ${a._id}, Status: ${a.status}, Date: ${a.appointmentDate}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
