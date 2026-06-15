const ActivityLog = require('../models/auth/ActivityLog');

// ✅ GET ALL LOGS (Admin/SuperAdmin only)
exports.getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .populate('target')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ GET LOGS BY USER
exports.getUserLogs = async (req, res) => {
  try {
    const userId = req.params.userId;
    const logs = await ActivityLog.find({ user: userId })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(100);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ GET RECENT LOGS
exports.getRecentLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .populate('target')
      .sort('-createdAt')
      .limit(limit);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ GET LOGS BY ACTION TYPE
exports.getLogsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const logs = await ActivityLog.find({ action })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(100);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ GET LOGS BY DATE RANGE
exports.getLogsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ DELETE OLD LOGS (Admin only - cleanup)
exports.deleteOldLogs = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: date }
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old logs`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};