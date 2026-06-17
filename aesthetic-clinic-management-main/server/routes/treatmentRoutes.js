const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');

router.post('/', treatmentController.createTreatment);
router.get('/', treatmentController.getAllTreatments);
router.put('/:id', treatmentController.updateTreatment);
router.delete('/:id', treatmentController.deleteTreatment);

module.exports = router;
