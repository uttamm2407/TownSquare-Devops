const mongoose = require("mongoose");

const connectDB = async () => {
    // console.log(process.env.MONGODB_URI, "Connect")
    try{
        await mongoose.connect(process.env.MONGODB_URI, {
            
        });
        console.log("MongoDB Connected...");
    }
    catch (err){
        console.error("Error connecting to MongoDB", err);
        process.exit(1);
    }
};
// console.log(connectDB.User.getIndexes())

module.exports = connectDB;