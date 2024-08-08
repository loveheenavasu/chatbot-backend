import bcrypt from 'bcrypt';
import { config } from 'dotenv';
config();
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import * as Models from '../models/index';
import { Types } from 'mongoose';
import random from 'randomstring';
import * as Handler from '../handler/handler';
import { IErrorResponse, InvalidToken, Unauthorized } from '../handler/error';
import { IToken } from '../interfaces/common.interface';
import ISession from '../interfaces/session.interface';
import IUser from '../interfaces/user.interface';

const { SALT_ROUND, SECRET_KEY } = process.env;

const setOptions = (pagination = 1, limit = 10, sort = { _id: -1 }) => {
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
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const hashPassword = async (password: string) => {
    try {
        let response = await bcrypt.hash(password, Number(SALT_ROUND));
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const comparePassword = async (hashPassword: string, password: string) => {
    try {
        let response = await bcrypt.compare(password, hashPassword);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const generateOtp = () => {
    try {
        let options = {
            length: 4,
            charset: 'numeric'
        }
        let response = random.generate(options);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const generateUniqueCode = () => {
    try {
        let options = {
            length: 6,
            charset: 'alphabetic'
        }
        let response = random.generate(options);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}


const signToken = async (data: IToken) => {
    try {
        data.tokenGenAt = moment().utc().valueOf();
        let token: string = jwt.sign(data, String(SECRET_KEY), { expiresIn: '60s' });
        await saveSession(token, data)
        return token;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const saveSession = async (token: string, data: IToken) => {
    try {
        let { _id, tokenGenAt } = data
        let saveData: ISession = {
            accessToken: token,
            tokenGenAt: tokenGenAt,
            userId: _id
        }
        let response: ISession = await Models.sessionModel.create(saveData);
        return response;

    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const verifyToken = async (token: string) => {
    try {
        let data = jwt.verify(token, String(SECRET_KEY)) as IToken;
        let checkSession = await checkSessionData(data);
        if (!checkSession) return Handler.handleCustomError(Unauthorized);
        return data;
    }
    catch (err: IErrorResponse | any) {
        if (err?.message == "jwt expired") {
            await Models.sessionModel.deleteOne({ accessToken: token });
            return Handler.handleCustomError(InvalidToken);
        }
        return Handler.handleCustomError(err);
    }
}

const checkSessionData = async (data: IToken) => {
    try {
        let query = { userId: new Types.ObjectId(data?._id!) };
        let projection = { __v: 0 }
        let option = { lean: true }
        let response: ISession | null = await Models.sessionModel.findOne(query, projection, option);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const fetchUser = async (query: object) => {
    try {
        let projection = { __v: 0, password: 0 }
        let option = { lean: true }
        let data: IUser | null = await Models.userModel.findOne(query, projection, option);
        return data;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
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