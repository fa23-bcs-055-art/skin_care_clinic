const User = require('../models/auth/User');
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const sendEmail = require("../utils/mailer");

// Helper response functions
const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

// 🔐 FORGOT PASSWORD - FIXED
exports.forgotPassword = async (req, res) => {
  try {
    console.log('========================================');
    console.log('📧 FORGOT PASSWORD REQUEST RECEIVED');
    console.log('📧 Request body:', req.body);

    const { email } = req.body;

    if (!email) {
      console.log('❌ No email provided');
      return errorResponse(res, "Email is required", 400);
    }

    console.log('📧 Looking for user with email:', email);

    // 1️⃣ Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return errorResponse(res, "User not found with this email", 404);
    }
    console.log('✅ User found:', user.email);
    console.log('✅ User name:', user.name);
    console.log('✅ User ID:', user._id);

    // 2️⃣ Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log('🔑 Reset token generated');

    // 3️⃣ Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4️⃣ Save token in DB
    console.log('💾 Saving token to database...');
    const updateResult = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpire: Date.now() + 15 * 60 * 1000
        }
      }
    );
    console.log('✅ Token saved to DB:', updateResult);

    // 5️⃣ Create reset link
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;
    console.log('🔗 Reset link generated:', resetLink);

    // 6️⃣ Send email
    console.log('📧 Attempting to send email to:', user.email);

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetLink}</p>
          <p><strong>This link will expire in 15 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
        </div>
      `
    });

    console.log('📧 Email result:', emailResult);

    // Check if email was sent successfully
    if (!emailResult || !emailResult.success) {
      console.error('❌ Email sending failed:', emailResult?.error || 'Unknown error');
      // For development - return the reset link so user can still reset password
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Development mode: Returning reset link in response');
        return successResponse(res, "Reset link generated (email disabled in dev)", {
          resetLink,
          emailSent: false
        });
      }
      return errorResponse(res, emailResult?.error || "Failed to send email. Please try again.", 500);
    }

    console.log('✅✅✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY!');
    console.log('========================================');
    return successResponse(res, "Password reset email sent successfully");

  } catch (error) {
    console.error('❌❌❌ FORGOT PASSWORD ERROR:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    console.error('========================================');
    return errorResponse(res, error.message || "Server error", 500);
  }
};

// 🔐 RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('🔑 Reset password request');

    if (!password || password.length < 6) {
      return errorResponse(res, "Password must be at least 6 characters", 400);
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset token", 400);
    }

    console.log('✅ User found for reset:', user.email);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✅ Password reset successful for:', user.email);

    return successResponse(res, "Password reset successful");

  } catch (error) {
    console.error("❌ Reset password error:", error);
    return errorResponse(res, "Server error", 500);
  }
};