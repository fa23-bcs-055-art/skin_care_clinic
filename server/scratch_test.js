const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'undefined');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Mailer verification failed:', error.message);
  } else {
    console.log('✅ Mailer is ready — SMTP connection verified.');
  }
});
