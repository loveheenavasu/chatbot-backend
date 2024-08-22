import { Types } from "mongoose";

interface Fields {
    name?: string;
    type?: string;
    label?: string;
    value?: string;
}

export default interface UserInfo extends Fields {
    _id?: Types.ObjectId;
    documentId?: string;
    ipAddress?: string;
    fields?: Array<Fields>,
    createdAt?: number;
    updatedAt?: number;
}