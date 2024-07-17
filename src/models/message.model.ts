import mongoose, { Types } from 'mongoose';

const messageSchema = new mongoose.Schema({
    message: { type: String, default: null },
    chatId: { type: String, default: null },
    userId: { type: Types.ObjectId, default: null, ref:"users" },
    image: { type: String, default: null },
    createdAt: { type: Number, default: 0 },
    updatedAt: { type: Number, default: 0 },
})

const messageModel = mongoose.model("messages", messageSchema);
export default messageModel;