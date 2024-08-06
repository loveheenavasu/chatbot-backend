import { Types } from "mongoose";

export default interface IChatSession {
    _id?: Types.ObjectId;
    ipAddressId?: Types.ObjectId;
    sessionType?: String;
    createdAt?: number;
    updatedAt?: number;
}