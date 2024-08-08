import { Types } from "mongoose";

export default interface Ips {
    _id?: Types.ObjectId;
    ipAddress?: string;
    documentId?: string;
    createdAt?: number;
}