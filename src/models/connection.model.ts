import mongoose, { Types } from 'mongoose';

const connectionSchema = new mongoose.Schema({
    userId: { type: Types.ObjectId, default: null, ref: "users" }
})

const connectionModel = mongoose.model("connections", connectionSchema);
export default connectionModel;