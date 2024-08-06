import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import IChatSession from '../interfaces/chat-session.interface';
export enum sessionType {
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED"
}
const chatSessionSchema = new mongoose.Schema<IChatSession>({
    ipAddressId: { type: Types.ObjectId, default: null, ref: "Ips" },
    sessionType: { type: String, enum: Object.values(sessionType), default: sessionType.ONGOING },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false // Disable automatic timestamps
})

const chatSessionModel = mongoose.model<IChatSession>("ChatSessions", chatSessionSchema);
export default chatSessionModel;