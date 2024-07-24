import moment from 'moment';
import mongoose, { Types } from 'mongoose';

export enum type {
    TEXT = "TEXT",
    FILE = "FILE"
}

const textSchema = new mongoose.Schema({
    text: { type: String, default: null },
    type: { type: String, default: type.TEXT, enum: type },
    fileName: { type: String, default: null },
    documentId: { type: String, default: null },
    docNo: { type: Number, default: 1 },
    userId: { type: Types.ObjectId, default: null, ref: "users" },
    createdAt: { type: Number, default: moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
})

const textModel = mongoose.model("texts", textSchema);
export default textModel;