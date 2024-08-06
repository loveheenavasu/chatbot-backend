import mongoose, { Types } from 'mongoose';
import moment from 'moment';
import IMessage from '../interfaces/message.interface';
export enum role {
    User = "USER",
    AI = "AI"
}
const messageSchema = new mongoose.Schema<IMessage>({
    message: { type: String, default: null },
    ipAddressId: { type: Types.ObjectId, default: null, ref: "Ips" },
    sessionId: { type: Types.ObjectId, default: null, ref: "ChatSessions" },
    documentId: { type: String, default: null },
    messageType: { type: String, default: null, enum: Object.values(role) },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 },
}, {
    timestamps: false
})

const messageModel = mongoose.model<IMessage>("Messages", messageSchema);
export default messageModel;