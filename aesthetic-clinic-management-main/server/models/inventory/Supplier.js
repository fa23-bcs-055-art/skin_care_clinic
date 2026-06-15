const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  contact: { type: String },
  company: { type: String },
  address: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Supplier', SupplierSchema);