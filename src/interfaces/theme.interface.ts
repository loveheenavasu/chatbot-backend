import { Types } from "mongoose";


export default interface Theme {
    _id?: Types.ObjectId;
    theme: string;
    color?: string;
    documentId: string;
    createdAt?: number;
    updatedAt?: number;
}