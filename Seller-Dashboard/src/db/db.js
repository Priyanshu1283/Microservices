const mongoose = require('mongoose');

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongooDb is connected to Seller Dashboard");
    } catch (error) {
        console.log('Error is DB connection', error);
    }
}

module.exports = connectDB;