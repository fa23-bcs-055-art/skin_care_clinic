const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  stockQuantity: { type: Number, default: 0 },
  purchasePrice: { type: Number },
  sellingPrice: { type: Number },
  lowStockAlert: { type: Number, default: 10 },
  expiryDate: { type: Date }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Inventory', InventorySchema);