import { Types } from "mongoose";

export default interface ChatSession {
    _id?: Types.ObjectId;
    ipAddressId?: Types.ObjectId;
    sessionType?: String;
    createdAt?: number;
    updatedAt?: number;
}