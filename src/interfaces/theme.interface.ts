import { Types } from "mongoose";


export default interface Theme {
    _id?: Types.ObjectId;
    primaryTheme: string;
    primaryText: string;
    secondaryTheme: string;
    secondaryText: string;
    documentId: string;
    createdAt?: number;
    updatedAt?: number;
}