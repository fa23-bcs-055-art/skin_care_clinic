const Treatment = require('../models/treatment/Treatment');

exports.createTreatment = async (req, res) => {
  try {
    const { name, cost } = req.body;
    if (!name || cost === undefined) {
      return res.status(400).json({ error: 'Validation failed: `name` and `cost` are required.' });
    }

    const treatment = await Treatment.create(req.body);
    res.status(201).json(treatment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find();
    res.json(treatments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(treatment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTreatment = async (req, res) => {
  try {
    await Treatment.findByIdAndDelete(req.params.id);
    res.json({ message: "Treatment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};