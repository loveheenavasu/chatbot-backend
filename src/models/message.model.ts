import mongoose, { Types } from 'mongoose';
import moment from 'moment';
import Message from '../interfaces/message.interface';
export enum Role {
    User = "USER",
    AI = "AI"
}
const messageSchema = new mongoose.Schema<Message>({
    message: { type: String, default: null },
    ipAddressId: { type: Types.ObjectId, default: null, ref: "Ips" },
    sessionId: { type: Types.ObjectId, default: null, ref: "ChatSessions" },
    documentId: { type: String, default: null },
    messageType: { type: String, default: null, enum: Object.values(Role) },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 },
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const messageModel = mongoose.model<Message>("Messages", messageSchema);
export default messageModel;