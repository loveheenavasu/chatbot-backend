import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import ChatSession from '../interfaces/chat-session.interface';
export enum SessionType {
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED"
}
const chatSessionSchema = new mongoose.Schema<ChatSession>({
    ipAddressId: { type: Types.ObjectId, default: null, ref: "Ips" },
    sessionType: { type: String, enum: Object.values(SessionType), default: SessionType.ONGOING },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false /// Disable automatic timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const chatSessionModel = mongoose.model<ChatSession>("ChatSessions", chatSessionSchema);
export default chatSessionModel;