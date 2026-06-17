const User = require('../models/auth/User'); // ✅ Add this
const crypto = require("crypto");
const bcrypt = require('bcryptjs'); // ✅ Add for password hashing
const sendEmail = require("../utils/mailer");

// Helper response functions (add these or import from authController)
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

// 🔐 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Forgot password request for:', email);

    // 1️⃣ Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // 2️⃣ Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3️⃣ Hash token (DB me raw token save nahi karte)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4️⃣ Save token + expiry in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // 5️⃣ Create reset link
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    console.log('🔗 Reset link generated:', resetLink);

    // 6️⃣ Send email
    const emailSent = await sendEmail({
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
      `,
    });

    if (!emailSent) {
      if (process.env.NODE_ENV !== 'production' && process.env.SHOW_RESET_LINK_FALLBACK === 'true') {
        console.warn('⚠️ Password reset email could not be sent; returning reset link for development.');
        return successResponse(res, "Password reset link generated. Use the link from server logs or response during development.", { resetLink });
      }
      return errorResponse(res, "Email not sent", 500);
    }

    return successResponse(res, "Password reset email sent successfully");

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return errorResponse(res, "Server error", 500);
  }
};

// 🔐 RESET PASSWORD (MISSING FUNCTION - ADD THIS)
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('🔑 Reset password request with token');

    if (!password || password.length < 6) {
      return errorResponse(res, "Password must be at least 6 characters", 400);
    }

    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset token", 400);
    }

    console.log('✅ User found:', user.email);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset fields
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
