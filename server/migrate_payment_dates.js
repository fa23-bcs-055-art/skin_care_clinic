const mongoose = require('mongoose');
const Payment = require('./models/finance/Payment');

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/aesthetic-clinic';

mongoose.connect(mongoURI).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Find all payments without paymentDate
    const paymentsWithoutDate = await Payment.find({
      $or: [
        { paymentDate: null },
        { paymentDate: undefined },
        { paymentDate: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${paymentsWithoutDate.length} payments without paymentDate`);

    let updated = 0;

    for (const payment of paymentsWithoutDate) {
      // Use approvedAt if available (approved payments), otherwise use createdAt
      const dateToSet = payment.approvedAt || payment.createdAt || new Date();
      
      await Payment.findByIdAndUpdate(
        payment._id,
        { paymentDate: dateToSet },
        { new: true }
      );
      
      updated++;
      console.log(`✅ Updated payment ${payment._id} with paymentDate: ${dateToSet}`);
    }

    console.log(`\n✅ Migration complete! Updated ${updated} payments`);

    // Show summary
    const approved = await Payment.find({ status: { $in: ['Approved', 'Success'] } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPayments = await Payment.find({
      status: { $in: ['Approved', 'Success'] },
      paymentDate: { $gte: today, $lt: tomorrow }
    });

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthPayments = await Payment.find({
      status: { $in: ['Approved', 'Success'] },
      paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    console.log(`\n📈 Summary:`);
    console.log(`Total approved payments: ${approved.length}`);
    console.log(`Today's payments: ${todayPayments.length}`);
    console.log(`This month payments: ${monthPayments.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
