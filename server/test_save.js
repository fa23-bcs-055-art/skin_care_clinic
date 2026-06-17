const mongoose = require('mongoose');
const User = require('./models/auth/User');
require('dotenv').config({ path: '../.env' });

async function testSave() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const user = await User.findOne({ email: 'mxtylish57@gmail.com' });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('User found:', user.email);
    user.resetPasswordToken = 'test_token';
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    
    await user.save();
    console.log('User saved successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error saving user:', err);
    process.exit(1);
  }
}

testSave();
