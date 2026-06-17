const User = require('../models/auth/User');
const Role = require('../models/auth/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require("express-validator");
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

// REGISTER USER - Send email verification
exports.registerUser = async (req, res, next) => {
  try {
    console.log('🔔 Register request body:', req.body);
    const { name, email, password, phone } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    // ✅ Check email uniqueness
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return errorResponse(res, "Email already exists", 400);
    }

    // ✅ Check phone uniqueness
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return errorResponse(res, "Phone number already exists", 400);
    }

    let patientRole = await Role.findOne({ roleName: 'Patient' });
    
    if (!patientRole) {
      patientRole = await Role.create({
        roleName: 'Patient',
        permissions: ['view_dashboard', 'view_appointments']
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 📧 Generate 6-digit email verification OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Create user record with email verification required
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      roleId: patientRole._id,
      status: 'active',
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send only numeric OTP in email (no clickable verification link). Verification must be via OTP screen.
    const emailSent = await sendEmail({
      to: user.email,
      subject: "Your Aesthetic Clinic verification code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Your verification code</h2>
          <p>Hello ${user.name},</p>
          <p>Use the code below to verify your email address on the verification screen:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #f6f6f6; padding: 20px 30px; border-radius: 10px; font-size: 28px; letter-spacing: 6px; font-weight: 700;">
              ${verificationToken}
            </div>
          </div>
          <p><strong>This code expires in 24 hours.</strong></p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });

    if (!emailSent) {
      console.error('❌ Verification email failed to send for', user.email);
      await User.deleteOne({ _id: user._id });
      return errorResponse(res, "Account could not be completed because verification email failed to send. Please try again.", 500);
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully. An OTP has been sent to your email.",
      data: {
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// LOGIN USER
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const user = await User.findOne({ email }).populate("roleId");
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // 📧 Strictly require email verification before allowing login
    if (!user.isEmailVerified || user.isVerified === false) {
      return errorResponse(res, "Please verify your email before logging in", 403);
    }

    if (user.status !== 'active') {
      return errorResponse(res, "Account is deactivated", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Set token expiry based on remember me
    const tokenExpiry = rememberMe ? "30d" : "7d";
    
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.roleId?.roleName || 'User',
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Set HTTP-only cookie for better security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.roleId?.roleName || 'User',
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// LOGOUT USER - FIXED
exports.logoutUser = async (req, res, next) => {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

// GET CURRENT USER
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('roleId')
      .select('-password');
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.roleId?.roleName || 'User',
        status: user.status
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

// 📧 VERIFY EMAIL (OTP-only via POST body)
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token;
    const email = req.body.email;

    // Require both token and email for OTP verification
    if (!token || !email) {
      return errorResponse(res, "Email and verification token are required", 400);
    }

    // Hash the token to match with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with token and check expiry, matching by email to avoid token collisions
    const user = await User.findOne({
      email: email,
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired verification code", 400);
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    return successResponse(res, "Email verified successfully! You can now login.", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    }, 200);

  } catch (error) {
    console.error('Email verification error:', error);
    next(error);
  }
};

// 📧 RESEND VERIFICATION EMAIL
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (user.isEmailVerified) {
      return errorResponse(res, "Email is already verified", 400);
    }

    // Generate new numeric 6-digit verification token for OTP-only verification
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email containing only the numeric OTP (no links)
    const emailSent = await sendEmail({
      to: user.email,
      subject: "Your Aesthetic Clinic verification code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Your verification code</h2>
          <p>Hello ${user.name},</p>
          <p>Use the code below to verify your email address on the verification screen:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #f6f6f6; padding: 20px 30px; border-radius: 10px; font-size: 28px; letter-spacing: 6px; font-weight: 700;">
              ${verificationToken}
            </div>
          </div>
          <p><strong>This code expires in 24 hours.</strong></p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });

    if (!emailSent) {
      return errorResponse(res, "Failed to send verification email", 500);
    }

    return successResponse(res, "Verification email sent successfully");

  } catch (error) {
    console.error('Resend verification email error:', error);
    next(error);
  }
};

// 📱 VERIFY PHONE - Complete Registration
exports.verifyPhone = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return errorResponse(res, "Verification token is required", 400);
    }

    // Hash the token to match with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with token and check expiry
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired verification link", 400);
    }

    // Mark account as verified and complete registration
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    return successResponse(res, "Phone verification successful! Your account has been created. You can now login.", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified
      }
    }, 200);

  } catch (error) {
    console.error('Phone verification error:', error);
    next(error);
  }
};