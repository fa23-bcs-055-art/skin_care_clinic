const Patient = require('../models/patient/Patient');
const User = require('../models/auth/User');
const Role = require('../models/auth/Role');

// Helper: ensure all 'Patient' role users have a Patient document
const ensurePatientProfiles = async () => {
  try {
    const patientRole = await Role.findOne({ roleName: 'Patient' });
    if (!patientRole) return;

    const patientUsers = await User.find({ roleId: patientRole._id });
    for (const user of patientUsers) {
      const exists = await Patient.findOne({ userId: user._id });
      if (!exists) {
        await Patient.create({
          userId: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email
        });
      }
    }
  } catch (err) {
    console.error('⚠️ ensurePatientProfiles error:', err.message);
  }
};

// Create patient
exports.createPatient = async (req, res) => {
  try {
    console.log('Creating patient with data:', req.body);
    
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ 
        error: "Name is required" 
      });
    }

    const patientData = { ...req.body };

    const patient = await Patient.create(patientData);

    // If custom joinedDate was provided, force set the createdAt timestamp with timestamps: false
    if (req.body.joinedDate) {
      await Patient.findByIdAndUpdate(
        patient._id,
        { createdAt: new Date(req.body.joinedDate) },
        { timestamps: false }
      );
    }

    const populated = await Patient.findById(patient._id).populate('serviceId', 'name');
    console.log('Patient created:', populated);
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors // Send validation errors if any
    });
  }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    // Ensure registered users who are patients also have Patient documents
    await ensurePatientProfiles();

    const patients = await Patient.find()
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single patient
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('serviceId', 'name');
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If a custom joinedDate was sent, use it as createdAt
    // If custom joinedDate was provided, save the date to force update later
    let forceJoinedDate = null;
    if (updateData.joinedDate) {
      forceJoinedDate = new Date(updateData.joinedDate);
      delete updateData.joinedDate;
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('serviceId', 'name');
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    if (forceJoinedDate) {
      const updatedPatient = await Patient.findByIdAndUpdate(
        patient._id,
        { createdAt: forceJoinedDate },
        { new: true, timestamps: false }
      ).populate('serviceId', 'name');
      return res.json(updatedPatient);
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: error.message });
  }
};
