const nodemailer = require("nodemailer");

console.log('🔧 Initializing mailer with:');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET');
console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET (length: ' + process.env.EMAIL_PASS.length + ')' : '❌ NOT SET');
console.log('📧 SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');
console.log('📧 SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

// Verify transporter
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Mailer verification FAILED:');
    console.error('   Error:', error.message);
  } else {
    console.log('✅✅✅ Mailer is READY! SMTP connection verified.');
  }
});

// Send Email Function - FIXED
const sendEmail = async ({ to, subject, html }) => {
  console.log('📧 sendEmail called with:', { to, subject });

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials missing');
      return { success: false, error: 'Email credentials not configured' };
    }

    const mailOptions = {
      from: `"Clinic App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log('📧 Sending mail to:', to);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌❌❌ EMAIL SEND FAILED:");
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);

    if (error.code === 'EAUTH') {
      console.error('   💡 AUTHENTICATION FAILED: Check your App Password');
    } else if (error.code === 'ECONNECTION') {
      console.error('   💡 CONNECTION FAILED: Check internet/SMTP settings');
    }

    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
