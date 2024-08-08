import moment from 'moment';
import mongoose, { Types } from 'mongoose';
import Text from '../interfaces/text.interface';

export enum Type {
    TEXT = "TEXT",
    FILE = "FILE"
}

const textSchema = new mongoose.Schema<Text>({
    text: { type: String, default: null },
    type: { type: String, default: Type.TEXT, enum: Object.values(Type) },
    fileName: { type: String, default: null },
    documentId: { type: String, default: null },
    docNo: { type: Number, default: 1 },
    userId: { type: Types.ObjectId, default: null, ref: "Users" },
    createdAt: { type: Number, default: () => moment().utc().valueOf() },
    updatedAt: { type: Number, default: 0 }
}, {
    timestamps: false // Disable timestamp because we are handling createdAt and updatedAt manually, if we are setting this to true then it will create automatically createdAt and updatedAt with Date type.
})

const textModel = mongoose.model<Text>("Texts", textSchema);
export default textModel;