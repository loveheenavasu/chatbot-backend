import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import * as Models from '../models/index';
import { Types } from 'mongoose';
import random from 'randomstring';
import * as Handler from '../handler/handler';
import { ErrorResponse, InvalidToken, Unauthorized } from '../handler/error';
import { Token } from '../interfaces/common.interface';
import Session from '../interfaces/session.interface';
import User from '../interfaces/user.interface';
import { config } from 'dotenv';
config();

const { SALT_ROUND, SECRET_KEY } = process.env;
const projection = { __v: 0 };
const option = { lean: true };

const setOptions = (pagination = 1, limit = 10, sort = { _id: -1 }): object => {
    try {
        const options = {
            lean: true,
            skip: (pagination - 1) * limit,
            limit: Number(limit),
            sort,
        };
        return options;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const hashPassword = async (password: string): Promise<string> => {
    try {
        const response = await bcrypt.hash(password, Number(SALT_ROUND));
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const comparePassword = async (hashPassword: string, password: string): Promise<boolean> => {
    try {
        const response = await bcrypt.compare(password, hashPassword);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const generateOtp = (): string => {
    try {
        const options = {
            length: 4,
            charset: 'numeric'
        }
        const response = random.generate(options);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const generateUniqueCode = (): string => {
    try {
        const options = {
            length: 6,
            charset: 'alphabetic'
        }
        const response = random.generate(options);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}


const signToken = async (data: Token): Promise<string> => {
    try {
        data.tokenGenAt = moment().utc().valueOf();
        const token: string = jwt.sign(data, String(SECRET_KEY), { expiresIn: '30m' });
        await saveSession(token, data)
        return token;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const saveSession = async (token: string, data: Token): Promise<Session> => {
    try {
        const { _id, tokenGenAt } = data
        const saveData: Session = {
            accessToken: token,
            tokenGenAt: tokenGenAt,
            userId: _id
        }
        const response = await Models.sessionModel.create(saveData);
        return response;

    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const verifyToken = async (token: string): Promise<Token> => {
    try {
        const data = jwt.verify(token, String(SECRET_KEY)) as Token;
        const checkSession = await checkSessionData(data);
        if (!checkSession) return Handler.handleCustomError(Unauthorized);
        return data;
    }
    catch (err: ErrorResponse | any) {
        if (err?.message == "jwt expired") {
            await Models.sessionModel.deleteOne({ accessToken: token });
            return Handler.handleCustomError(InvalidToken);
        }
        return Handler.handleCustomError(err);
    }
}

const checkSessionData = async (data: Token): Promise<Session | null> => {
    try {
        const query = { userId: new Types.ObjectId(data._id) };
        const response = await Models.sessionModel.findOne(query, projection, option);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const fetchUser = async (query: object): Promise<User | null> => {
    try {
        const projection = { __v: 0, password: 0 }
        const data = await Models.userModel.findOne(query, projection, option);
        return data;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}


export {
    setOptions,
    hashPassword,
    comparePassword,
    generateOtp,
    generateUniqueCode,
    signToken,
    verifyToken,
    fetchUser
}