import moment from 'moment';
import mongoose, { Types } from 'mongoose';

const textSchema = new mongoose.Schema({
    text: { type: String, default: null },
    documentId: { type: String, default: null },
    userId: { type: Types.ObjectId, default: null, ref: "users" },
    createdAt: { type: Number, default: moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
})

const textModel = mongoose.model("texts", textSchema);
export default textModel;