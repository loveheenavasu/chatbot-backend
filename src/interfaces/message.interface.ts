import { Types } from "mongoose";

export default interface IMessage {
    _id?: Types.ObjectId;
    message?: string | null;
    ipAddressId?: Types.ObjectId;
    sessionId?: Types.ObjectId;
    documentId?: string;
    messageType?: string;
    createdAt?: number;
    updatedAt?: number;
}