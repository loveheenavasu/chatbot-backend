import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import Session from '../interfaces/session.interface';


const sessionSchema = new mongoose.Schema<Session>({
    userId: { type: Types.ObjectId, default: null, ref: "Users" },
    accessToken: { type: String, default: null },
    tokenGenAt: { type: Number, default: 0 },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const sessionModel = mongoose.model<Session>("Sessions", sessionSchema);
export default sessionModel;