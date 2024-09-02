import { Types } from "mongoose";

interface Fields {
    name?: string;
    type?: string;
    label?: string;
    isRequired?: boolean;
    isCustom?: boolean;
}

export default interface Forms extends Fields {
    _id?: Types.ObjectId;
    documentId?: string;
    fields?: Array<Fields>,
    createdAt?: number;
    updatedAt?: number;
}