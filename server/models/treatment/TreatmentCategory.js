const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TreatmentCategorySchema = new Schema({
  categoryName: { type: String, required: true },
  description: { type: String },
  seoTitle: { type: String },
  metaDescription: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TreatmentCategory', TreatmentCategorySchema);