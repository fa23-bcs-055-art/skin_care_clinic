const Patient = require('../models/patient/Patient');

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

    const patient = await Patient.create(req.body);
    console.log('Patient created:', patient);
    res.status(201).json(patient);
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
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single patient
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
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
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
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