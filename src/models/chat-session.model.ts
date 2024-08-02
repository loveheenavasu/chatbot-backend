import moment from 'moment';
import mongoose, { Types } from 'mongoose';
export enum sessionType {
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED"
}
const chatSessionSchema = new mongoose.Schema({
    ipAddressId: { type: Types.ObjectId, default: null, ref: "ips" },
    sessionType: { type: String, enum: sessionType, default: sessionType?.ONGOING },
    createdAt: { type: Number, default: moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
})

const chatSessionModel = mongoose.model("chatsessions", chatSessionSchema);
export default chatSessionModel;