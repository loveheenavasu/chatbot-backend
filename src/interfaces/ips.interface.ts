import { Types } from "mongoose";

export default interface IIps {
    _id?: Types.ObjectId;
    ipAddress?: string;
    documentId?: string;
    createdAt?: number;
}