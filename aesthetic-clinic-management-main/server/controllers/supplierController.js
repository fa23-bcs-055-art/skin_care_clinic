const Supplier = require('../models/inventory/Supplier');

// Create supplier - CORRECTED to match schema
exports.createSupplier = async (req, res) => {
  try {
    console.log('🏢 Creating supplier with data:', req.body);
    
    // Your schema uses supplierName (not name)
    const supplierName = req.body.supplierName;
    
    if (!supplierName) {
      return res.status(400).json({ 
        error: 'Supplier name is required.' 
      });
    }

    // Only include fields that exist in your schema
    const supplierData = {
      supplierName: supplierName,
      contact: req.body.contact || '',
      company: req.body.company || '',
      address: req.body.address || ''
    };

    console.log('Saving supplier:', supplierData);

    const supplier = await Supplier.create(supplierData);
    console.log('✅ Supplier created:', supplier);
    res.status(201).json(supplier);

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
};