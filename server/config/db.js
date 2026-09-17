const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vpms_db';
  try {
    // Attempt Mongoose connection with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Switching to Built-in Dynamic Store.`);
  }
};

const getDBStatus = () => ({
  type: isMongoConnected ? 'MongoDB' : 'In-Memory DB Store',
  isConnected: true
});

module.exports = { connectDB, getDBStatus, isConnected: () => isMongoConnected };
