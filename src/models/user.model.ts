import mongoose from 'mongoose';

export enum signType {
    GOOGLE = "GOOGLE"
}


const userSchema = new mongoose.Schema({
    name: { type: String, default: null },
    email: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, default: null },
    password: { type: String, default: null },
    otp: { type: String, default: null },
    uniqueCode: { type: String, default: null },
    type: { type: String, enum: signType, default: null },
    isEmailVerified: { type: Boolean, default: false },
    createdAt: { type: Number, default: 0 },
    updatedAt: { type: Number, default: 0 },
})

const userModel = mongoose.model("users", userSchema);
export default userModel;