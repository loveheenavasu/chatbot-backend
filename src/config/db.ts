import mongoose from 'mongoose';
import { config } from 'dotenv';
config();
// const { DB_HOST, DB_NAME, DB_PORT } = process.env;
const URI = process.env.URI as string;

const dbConnect = async () => {
    try {
        // const URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
        mongoose.connect(URI);
    }
    catch (err) {
        throw err;
    }
}

export {
    dbConnect
};