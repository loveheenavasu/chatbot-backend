import { Types } from "mongoose";

export default interface ChatSession {
    _id?: Types.ObjectId;
    ipAddressId?: Types.ObjectId;
    sessionType?: string;
    isFormCompleted?: boolean;
    createdAt?: number;
    updatedAt?: number;
}