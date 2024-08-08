import mongoose from 'mongoose';
import moment from 'moment';
import User from '../interfaces/user.interface';

export enum SignType {
    GOOGLE = "GOOGLE"
}

const userSchema = new mongoose.Schema<User>({
    name: { type: String, default: null },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    email: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, default: null },
    password: { type: String, default: null },
    otp: { type: String, default: null },
    uniqueCode: { type: String, default: null },
    type: { type: String, enum: Object.values(SignType), default: null },
    isEmailVerified: { type: Boolean, default: false },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 },
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const userModel = mongoose.model<User>("Users", userSchema);
export default userModel;