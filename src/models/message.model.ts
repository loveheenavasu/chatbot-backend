import mongoose, { Types } from 'mongoose';
export enum Role {
    User = "USER",
    AI = "AI"
}
const messageSchema = new mongoose.Schema({
    message: { type: String, default: null },
    ipAddressId: { type: Types.ObjectId, default: null, ref: "ips" },
    documentId: { type: String, default: null },
    messageType: { type: String, default: null, enum: Role },
    createdAt: { type: Number, default: 0 },
    updatedAt: { type: Number, default: 0 },
})

const messageModel = mongoose.model("messages", messageSchema);
export default messageModel;