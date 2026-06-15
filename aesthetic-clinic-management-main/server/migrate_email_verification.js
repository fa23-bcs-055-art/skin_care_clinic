// Migration script to set isEmailVerified for old accounts
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('./models/auth/User');

async function migrateEmailVerification() {
  try {
    console.log('🔄 Starting email verification migration...');
    console.log('📍 MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Missing');
    
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI not found in environment variables');
      }
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
    }

    // Update all users without isEmailVerified field
    const result = await User.updateMany(
      { isEmailVerified: { $exists: false } },
      { $set: { isEmailVerified: true } }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   - Updated: ${result.modifiedCount} users`);
    console.log(`   - Matched: ${result.matchedCount} users`);

    // Verify the update
    const unverifiedCount = await User.countDocuments({ isEmailVerified: false });
    const verifiedCount = await User.countDocuments({ isEmailVerified: true });
    const noFieldCount = await User.countDocuments({ isEmailVerified: { $exists: false } });

    console.log(`\n📊 Final Status:`);
    console.log(`   - Verified accounts: ${verifiedCount}`);
    console.log(`   - Unverified accounts: ${unverifiedCount}`);
    console.log(`   - Accounts without field: ${noFieldCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateEmailVerification();
