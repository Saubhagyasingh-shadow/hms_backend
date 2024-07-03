import mongoose from "mongoose";
import { HMS_CONSTANTS } from '../constants.js';

const DB_NAME = HMS_CONSTANTS.DB_NAME;
const connectDB = async () => {
    try {
        const dbvar=`${process.env.MONGO_URI}/${DB_NAME}`
        console.log(dbvar);
        const conn = await mongoose.connect(dbvar);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}, MongoDB connection error failed`);
        process.exit(1);
    }
};

export default connectDB;
