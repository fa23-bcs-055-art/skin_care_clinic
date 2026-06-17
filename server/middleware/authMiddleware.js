const jwt = require("jsonwebtoken");
const User = require('../models/auth/User');
require("dotenv").config();

exports.verifyToken = async (req, res, next) => {
  // First try to get token from cookie
  let token = req.cookies?.token;
  
  // If no cookie token, check Authorization header
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id)
      .populate('roleId')
      .select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact SuperAdmin."
      });
    }

    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Try again later."
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.roleId?.roleName || decoded.role,
      roleId: user.roleId?._id,
      permissions: user.roleId?.permissions || [],
      department: user.department,
      status: user.status
    };
    
    console.log('✅ Token verified for user:', user.name);
    console.log('   roleId object:', user.roleId);
    console.log('   roleId.roleName:', user.roleId?.roleName);
    console.log('   decoded.role:', decoded.role);
    console.log('   Final role in req.user:', req.user.role);
    console.log('   USER OBJECT:', JSON.stringify(req.user, null, 2));
    
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

// ✅ Admin check - simple and effective
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: 'Access denied. Not authenticated.' });
  }
  
  // Check if role contains 'admin' (case-insensitive)
  const role = (req.user?.role || '').toString().toLowerCase();
  if (role.includes('admin')) {
    return next();
  }
  
  res.status(403).json({ error: 'Access denied. Admin only.' });
};

// ✅ UPDATE EXPORTS
module.exports = { verifyToken: exports.verifyToken, isAdmin };