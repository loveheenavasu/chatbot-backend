import { Types } from "mongoose";


export default interface Theme {
    _id?: Types.ObjectId;
    theme: string;
    createdAt?: number;
    updatedAt?: number;
}