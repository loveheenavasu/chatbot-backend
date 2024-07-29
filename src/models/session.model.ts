import moment from 'moment';
import mongoose, { Types } from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: Types.ObjectId, default: null, ref: "users" },
    accessToken: { type: String, default: null },
    tokenGenAt: { type: Number, default: 0 },
    createdAt: { type: Number, default: moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
})

const sessionModel = mongoose.model("sessions", sessionSchema);
export default sessionModel;