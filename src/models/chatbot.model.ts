import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import Chatbot from '../interfaces/chatbot.interface';

const chatbotSchema = new mongoose.Schema<Chatbot>({
    textId: { type: Types.ObjectId, default: null, ref: "Texts" },
    userId: { type: Types.ObjectId, default: null, ref: "Users" },
    documentId: { type: String, default: null },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const chatbotModel = mongoose.model<Chatbot>("Chatbots", chatbotSchema);
export default chatbotModel;