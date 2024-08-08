import mongoose from 'mongoose';
import { config } from 'dotenv';
config();
const URI = process.env.URI as string;

const dbConnect = async () => {
    try {
        await mongoose.connect(URI);
        console.log("Connected to db")
    }
    catch (err) {
        throw err;
    }
}

export {
    dbConnect
};