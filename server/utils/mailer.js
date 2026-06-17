const nodemailer = require("nodemailer");

// Check if email credentials are configured
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASS not configured in .env');
  console.warn('   Email sending will fail. Set them in .env or .env.local');
  console.warn('   Example:');
  console.warn('   EMAIL_USER=your-gmail@gmail.com');
  console.warn('   EMAIL_PASS=your-app-password (use Gmail App Password, not your password)');
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // simple & stable
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter at startup so we get immediate auth errors
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Mailer verification failed:', error && error.message ? error.message : error);
    console.error('   Check EMAIL_USER/EMAIL_PASS and that your Gmail account allows SMTP (use App Passwords).');
  } else {
    console.log('✅ Mailer is ready — SMTP connection verified.');
  }
});

// Send Email Function
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured. Cannot send email to:', to);
      return false;
    }

    const mailOptions = {
      from: `"Clinic App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log detailed delivery info for debugging (don't log secrets)
    console.log("✅ Email send result:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    // If SMTP accepted at least one recipient, consider it sent
    const sent = Array.isArray(info.accepted) && info.accepted.length > 0;
    if (!sent) {
      console.warn('⚠️ SMTP did not accept the recipient address. Check the `accepted`/`rejected` arrays above.');
    }

    return sent;
  } catch (error) {
    console.error("❌ Email error:", error.message || error);
    return false;
  }
};

module.exports = sendEmail;