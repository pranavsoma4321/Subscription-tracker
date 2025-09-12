import mongoose from 'mongoose';
import { DB_URL, NODE_ENV} from "../config/env.js";

if(!DB_URL) {
    throw new Error('MongoDB URL is required');
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URL);

        console.log(`Connected to Database in ${NODE_ENV} mode`);

    } catch (error) {
        console.log('MongoDB connection error', error);

        process.exit(1);
    }
}

export default connectToDatabase;