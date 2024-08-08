import mongoose from 'mongoose';
import moment from 'moment';
import IUser from '../interfaces/user.interface';

export enum signType {
    GOOGLE = "GOOGLE"
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, default: null },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    email: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, default: null },
    password: { type: String, default: null },
    otp: { type: String, default: null },
    uniqueCode: { type: String, default: null },
    type: { type: String, enum: Object.values(signType), default: null },
    isEmailVerified: { type: Boolean, default: false },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 },
}, {
    timestamps: false
})

const userModel = mongoose.model<IUser>("Users", userSchema);
export default userModel;