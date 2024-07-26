import moment from 'moment';
import mongoose, { Types } from 'mongoose';

const chatbotSchema = new mongoose.Schema({
    textId: { type: Types.ObjectId, default: null, ref: "texts" },
    userId: { type: Types.ObjectId, default: null, ref: "users" },
    documentId: { type: String, default: null },
    createdAt: { type: Number, default: moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
})

const chatbotModel = mongoose.model("chatbots", chatbotSchema);
export default chatbotModel;