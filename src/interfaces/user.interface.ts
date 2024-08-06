import { Types, Document } from "mongoose";

export default interface IUser {
    _id?: Types.ObjectId;
    name?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    isAdmin?: boolean;
    image?: string;
    password?: string;
    otp?: string;
    uniqueCode?: string;
    type?: string;
    isEmailVerified?: boolean;
    createdAt?: number;
    updatedAt?: number;
    accessToken?: string;
    _doc?: any;
}
