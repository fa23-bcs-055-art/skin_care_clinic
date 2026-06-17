const AuditLog = require('../models/auth/ActivityLog');

// ✅ YOUR EXISTING CODE - KEPT INTACT
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
};

// 🔥 NEW MIDDLEWARES - ADD THESE

// ===== SUPER ADMIN ONLY =====
exports.superAdminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (req.user.role !== 'SuperAdmin') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Super Admin only." 
    });
  }

  next();
};

// ===== ADMIN AND ABOVE =====
exports.adminAndAbove = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin only." 
    });
  }

  next();
};

// ===== CHECK PERMISSION =====
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // SuperAdmin has all permissions
    if (req.user.role === 'SuperAdmin') {
      return next();
    }

    // Check if user has the required permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. ${permission} permission required.` 
      });
    }

    next();
  };
};

// ===== DEPARTMENT ACCESS =====
exports.checkDepartment = (allowedDepartments) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // SuperAdmin can access anything
    if (req.user.role === 'SuperAdmin') {
      return next();
    }

    if (!allowedDepartments.includes(req.user.department)) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Department restriction." 
      });
    }

    next();
  };
};

// ===== RESOURCE OWNERSHIP CHECK =====
exports.checkResourceOwnership = (model) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      // SuperAdmin can access anything
      if (req.user.role === 'SuperAdmin') {
        return next();
      }

      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false,
          message: "Resource not found" 
        });
      }

      // Check if user owns the resource (if resource has userId field)
      if (resource.userId && resource.userId.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied. You don't own this resource." 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  };
};