const Doctor = require('../models/doctorStaff/Doctor');

// ✅ PUBLIC - Doctor info dikhao
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne();
    res.json(doctor || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN - Doctor info update
exports.updateDoctor = async (req, res) => {
  try {
    let doctor = await Doctor.findOne();
    
    if (doctor) {
      doctor = await Doctor.findByIdAndUpdate(
        doctor._id,
        req.body,
        { new: true }
      );
    } else {
      doctor = await Doctor.create(req.body);
    }
    
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};