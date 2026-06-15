const Notification = require('../models/notification/Notification');
const User = require('../models/auth/User');

// Helper to create notification for specific user
const createNotification = async (userId, title, message, type, data = {}) => {
  try {
    if (!userId) return;
    await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      isRead: false
    });
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

// Helper to notify all admins
const notifyAdmins = async (title, message, type, data = {}) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['Admin', 'SuperAdmin'] } 
    }).select('_id');
    
    for (const admin of admins) {
      await createNotification(admin._id, title, message, type, data);
    }
  } catch (error) {
    console.error('Admin notification error:', error);
  }
};

// Helper to notify specific patient
const notifyPatient = async (patientId, title, message, type, data = {}) => {
  try {
    if (patientId) {
      await createNotification(patientId, title, message, type, data);
    }
  } catch (error) {
    console.error('Patient notification error:', error);
  }
};

// Helper to notify all patients
const notifyAllPatients = async (title, message, type, data = {}) => {
  try {
    const patients = await User.find({ role: 'Patient' }).select('_id');
    
    for (const patient of patients) {
      await createNotification(patient._id, title, message, type, data);
    }
  } catch (error) {
    console.error('Patient notification error:', error);
  }
};

// ========== GET USER NOTIFICATIONS ==========
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);
    
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    
    res.json({ 
      notifications, 
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== MARK AS READ ==========
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== MARK ALL AS READ ==========
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== DELETE NOTIFICATION ==========
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ========== EXPORT HELPERS ==========
module.exports.createNotification = createNotification;
module.exports.notifyAdmins = notifyAdmins;
module.exports.notifyPatient = notifyPatient;
module.exports.notifyAllPatients = notifyAllPatients;