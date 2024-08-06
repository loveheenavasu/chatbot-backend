import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import IText from '../interfaces/text.interface';


export enum type {
    TEXT = "TEXT",
    FILE = "FILE"
}

const textSchema = new mongoose.Schema<IText>({
    text: { type: String, default: null },
    type: { type: String, default: type.TEXT, enum: Object.values(type) },
    fileName: { type: String, default: null },
    documentId: { type: String, default: null },
    docNo: { type: Number, default: 1 },
    userId: { type: Types.ObjectId, default: null, ref: "Users" },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false
})

const textModel = mongoose.model<IText>("Texts", textSchema);
export default textModel;