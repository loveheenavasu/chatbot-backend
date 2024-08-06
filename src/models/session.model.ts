import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import ISession from '../interfaces/session.interface';


const sessionSchema = new mongoose.Schema<ISession>({
    userId: { type: Types.ObjectId, default: null, ref: "Users" },
    accessToken: { type: String, default: null },
    tokenGenAt: { type: Number, default: 0 },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false
})

const sessionModel = mongoose.model<ISession>("Sessions", sessionSchema);
export default sessionModel;