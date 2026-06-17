const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InventoryLogSchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Inventory', 
    required: true 
  },
  productName: { type: String },
  quantityChanged: { 
    type: Number, 
    required: true 
  },
  previousQuantity: { type: Number, default: 0 },
  newQuantity: { type: Number, default: 0 },
  type: { 
    type: String, 
    enum: ['Added', 'Used', 'Expired', 'Adjusted', 'Purchased'], 
    required: true 
  },
  reference: { type: String },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  purchasePrice: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

InventoryLogSchema.index({ productId: 1, date: -1 });
InventoryLogSchema.index({ supplierId: 1, date: -1 });
InventoryLogSchema.index({ type: 1 });

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);