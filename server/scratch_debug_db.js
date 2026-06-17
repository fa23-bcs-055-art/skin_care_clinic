const mongoose = require('mongoose');
const Role = require('./models/auth/Role');
const User = require('./models/auth/User');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://LaibaSagheer:Laiba%40185@ac-qrjw8wb-shard-00-00.negjn77.mongodb.net:27017,ac-qrjw8wb-shard-00-01.negjn77.mongodb.net:27017,ac-qrjw8wb-shard-00-02.negjn77.mongodb.net:27017/?ssl=true&replicaSet=atlas-n80a76-shard-0&authSource=admin&appName=Cluster0";

async function debug() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const roles = await Role.find();
    console.log('Roles in DB:', roles.map(r => r.roleName));

    const users = await User.find().populate('roleId');
    console.log('Users in DB:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}): Role = ${u.roleId?.roleName}`);
    });

  } catch (err) {
    console.error('Debug failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
