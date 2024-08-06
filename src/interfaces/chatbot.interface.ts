import { Types } from "mongoose";

export default interface IChatbot {
    _id?: Types.ObjectId;
    textId?: Types.ObjectId;
    userId?: Types.ObjectId;
    documentId?: string;
    createdAt?: number;
    updatedAt?: number;
}