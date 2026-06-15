const mongoose = require('mongoose');
const Payment = require('./models/finance/Payment');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/aesthetic-clinic';

mongoose.connect(mongoURI).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Get all payments regardless of status
    const allPayments = await Payment.find();
    console.log(`\n📊 Total payments in database: ${allPayments.length}`);

    // Group by status
    const byStatus = {};
    allPayments.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });

    console.log('\n📈 Payments by status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Show sample payments
    if (allPayments.length > 0) {
      console.log('\n📋 Sample payments:');
      allPayments.slice(0, 5).forEach(p => {
        console.log(`  ID: ${p._id}`);
        console.log(`  Status: ${p.status}`);
        console.log(`  Amount: ${p.amount}`);
        console.log(`  paymentDate: ${p.paymentDate}`);
        console.log(`  createdAt: ${p.createdAt}`);
        console.log(`  approvedAt: ${p.approvedAt}`);
        console.log('  ---');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
