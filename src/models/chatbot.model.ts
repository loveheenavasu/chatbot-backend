import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import IChatbot from '../interfaces/chatbot.interface';

const chatbotSchema = new mongoose.Schema<IChatbot>({
    textId: { type: Types.ObjectId, default: null, ref: "Texts" },
    userId: { type: Types.ObjectId, default: null, ref: "Users" },
    documentId: { type: String, default: null },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false
})

const chatbotModel = mongoose.model<IChatbot>("Chatbots", chatbotSchema);
export default chatbotModel;