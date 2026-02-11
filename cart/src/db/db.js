const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Cart Service');
  } catch (error) {
    console.error('Error connecting to MongoDB Cart Service:', error);
  } 
}

module.exports = connectDB;