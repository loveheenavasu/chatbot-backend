import moment from 'moment';
import mongoose, { Types } from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: Types.ObjectId, default: null, ref: "users" },
    socialToken: { type: String, default: null },
    createdAt: { type: Number, default: moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
})

const sessionModel = mongoose.model("sessions", sessionSchema);
export default sessionModel;