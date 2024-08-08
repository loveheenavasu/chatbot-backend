import { Types } from "mongoose";
import IUser from "./user.interface";
import { Request } from 'express';

export interface CustomRequest extends Request {
    userData?: IUser;
}

export interface Token {
    _id?: string | Types.ObjectId;
    scope?: string;
    tokenGenAt?: number;
    iat?: number;
}

export interface NeoConfig {
    url: string;
    username: string;
    password: string;
}

export interface SocketResponse {
    message?: string | null,
    sessionId?: Types.ObjectId | string | null,
    type?: string
}

export interface SignupPayload {
    email: string;
    password: string;
    firstname: string;
    lastname?: string;
}