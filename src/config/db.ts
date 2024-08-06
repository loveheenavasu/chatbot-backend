import mongoose from 'mongoose';
import { config } from 'dotenv';
config();
const URI = process.env.URI as string;

const dbConnect = async () => {
    try {
        mongoose.connect(URI);
    }
    catch (err) {
        throw err;
    }
}

export {
    dbConnect
};