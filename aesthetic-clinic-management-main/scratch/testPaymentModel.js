require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../server/models/finance/Payment');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/clinic";

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const testPayment = {
      patientId: new mongoose.Types.ObjectId(),
      appointmentId: new mongoose.Types.ObjectId(),
      amount: 1500,
      paymentMethod: 'JazzCash',
      transactionId: `TXN-${Date.now()}`,
      screenshot: 'test-screenshot-base64-data',
      status: 'Pending',
      notes: 'Test note'
    };
    
    const payment = await Payment.create(testPayment);
    console.log('✅ Payment created successfully:', payment);
    
    await Payment.findByIdAndDelete(payment._id);
    console.log('✅ Cleanup done');
  } catch (err) {
    console.error('❌ Error testing Payment model:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

test();
