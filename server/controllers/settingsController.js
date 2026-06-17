const Settings = require('../models/Settings');

// ✅ PUBLIC - Settings dikhao
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Settings update
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (settings) {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        req.body,
        { new: true }
      );
    } else {
      settings = await Settings.create(req.body);
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};