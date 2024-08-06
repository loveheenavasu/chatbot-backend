import { Types } from "mongoose";


export default interface IText {
    _id?: Types.ObjectId;
    text?: string;
    type?: string;
    fileName?: string;
    documentId?: string;
    docNo?: number;
    userId?: Types.ObjectId;
    createdAt?: number;
    updatedAt?: number;
}