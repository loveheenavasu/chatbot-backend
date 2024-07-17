import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{type:String, default:null},
    email: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    image: { type: String, default: null },
    createdAt: { type: Number, default: 0 },
    updatedAt: { type: Number, default: 0 },
})

const userModel = mongoose.model("users", userSchema);
export default userModel;