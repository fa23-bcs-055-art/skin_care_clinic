require('dotenv').config();
const mongoose = require('mongoose');
const Gallery = require('../models/content/Gallery');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/clinic";

async function fixImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const result = await Gallery.updateMany(
      { image: { $regex: '^/uploads/undefined' } },
      { $set: { image: null } }
    );
    console.log('🔧 Updated documents:', result.nModified);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

fixImages();
