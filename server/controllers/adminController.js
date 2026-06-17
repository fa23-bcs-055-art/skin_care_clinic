const User = require('../models/auth/User');
const Role = require('../models/auth/Role');
const AuditLog = require('../models/auth/ActivityLog');
const ClinicSetting = require('../models/appointment/ClinicSetting'); // ✅ ADD THIS LINE
const { successResponse, errorResponse } = require("../utils/response");

// ===== GET ALL USERS WITH DETAILS =====
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;

    const query = {};
    if (role) query.roleId = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .populate('roleId')
      .populate('createdBy', 'name email')
      .select('-password')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ status: 'active' }),
      inactive: await User.countDocuments({ status: 'inactive' }),
      byRole: await User.aggregate([
        { $group: { _id: '$roleId', count: { $sum: 1 } } },
        { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'role' } }
      ])
    };

    return successResponse(res, "Users fetched successfully", {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    next(error);
  }
};

// ===== UPDATE USER ROLE =====
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleId, department, status } = req.body;

    // Prevent self-modification
    if (id === req.user.id) {
      return errorResponse(res, "Cannot modify your own account", 400);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { roleId, department, status },
      { new: true }
    ).populate('roleId').select('-password');

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_USER',
      target: user._id,
      targetModel: 'User',
      details: { roleId, department, status }
    });

    return successResponse(res, "User updated successfully", user);
  } catch (error) {
    next(error);
  }
};

// ===== TOGGLE USER STATUS =====
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deactivation
    if (id === req.user.id) {
      return errorResponse(res, "Cannot modify your own status", 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: user.status === 'active' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      target: user._id,
      targetModel: 'User'
    });

    return successResponse(res, `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`, {
      id: user._id,
      status: user.status
    });
  } catch (error) {
    next(error);
  }
};

// ===== DELETE USER =====
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      return errorResponse(res, "Cannot delete your own account", 400);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_USER',
      target: id,
      targetModel: 'User'
    });

    return successResponse(res, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ===== GET AUDIT LOGS =====
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email')
      .populate('target')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    return successResponse(res, "Audit logs fetched successfully", {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== GET ROLES WITH PERMISSIONS =====
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort('-level');
    return successResponse(res, "Roles fetched successfully", roles);
  } catch (error) {
    next(error);
  }
};

// ===== UPDATE ROLE PERMISSIONS =====
exports.updateRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions, description } = req.body;

    const role = await Role.findByIdAndUpdate(
      id,
      { permissions, description },
      { new: true }
    );

    if (!role) {
      return errorResponse(res, "Role not found", 404);
    }

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_SETTINGS',
      target: role._id,
      targetModel: 'Role',
      details: { permissions }
    });

    return successResponse(res, "Role updated successfully", role);
  } catch (error) {
    next(error);
  }
};

// ============================================
// ========== CLINIC SETTINGS FUNCTIONS ==========
// ============================================

// ===== GET CLINIC SETTINGS =====
exports.getClinicSettings = async (req, res) => {
  try {
    let settings = await ClinicSetting.findOne();
    if (!settings) {
      settings = await ClinicSetting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== UPDATE CLINIC SETTINGS =====
exports.updateClinicSettings = async (req, res) => {
  try {
    const { weeklyHours, holidays, specialHours, slotDuration, maxBookingsPerSlot, advanceBookingDays, minBookingNotice } = req.body;

    let settings = await ClinicSetting.findOne();
    if (!settings) {
      settings = new ClinicSetting();
    }

    if (weeklyHours) settings.weeklyHours = weeklyHours;
    if (holidays) settings.holidays = holidays;
    if (specialHours) settings.specialHours = specialHours;
    if (slotDuration) settings.slotDuration = slotDuration;
    if (maxBookingsPerSlot) settings.maxBookingsPerSlot = maxBookingsPerSlot;
    if (advanceBookingDays) settings.advanceBookingDays = advanceBookingDays;
    if (minBookingNotice) settings.minBookingNotice = minBookingNotice;

    settings.lastUpdatedBy = req.user.id;
    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_SETTINGS',
      target: settings._id,
      targetModel: 'ClinicSetting',
      details: { updatedFields: Object.keys(req.body) }
    });

    res.json(settings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== ADD HOLIDAY =====
exports.addHoliday = async (req, res) => {
  try {
    const { date, reason } = req.body;

    let settings = await ClinicSetting.findOne();
    if (!settings) {
      settings = new ClinicSetting();
    }

    settings.holidays.push({ date: new Date(date), reason });
    await settings.save();

    res.json(settings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== REMOVE HOLIDAY =====
exports.removeHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;

    const settings = await ClinicSetting.findOne();
    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }

    settings.holidays = settings.holidays.filter(h => h._id.toString() !== holidayId);
    await settings.save();

    res.json(settings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};