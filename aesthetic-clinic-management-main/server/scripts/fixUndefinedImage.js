const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'clinic';

(async () => {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    const db = client.db(dbName);
    const col = db.collection('galleries');
    const filter = { image: '/uploads/undefined' };
    const update = { $set: { image: null } };
    const result = await col.updateMany(filter, update);
    console.log(`🔧 Updated ${result.modifiedCount} documents`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
})();
