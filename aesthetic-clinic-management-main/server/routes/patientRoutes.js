const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// CRUD operations
router.post('/', patientController.createPatient);
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);  // ← ADD THIS
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;