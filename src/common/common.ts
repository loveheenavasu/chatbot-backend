import bcrypt from 'bcrypt';
import { config } from 'dotenv';
config();
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import * as Models from '../models/index';
import { Types } from 'mongoose';
import random from 'randomstring';
import Handler from '../handler/handler';
import { Unauthorized } from '../handler/error';
const { SALT_ROUND, SECRET_KEY } = process.env;


export default class CommonHelper {

    static setOptions = async (pagination: any, limit: any, sort?:any) => {
        try {
            const defaultLimit = 10
            let options: any = {
                lean: true,
                sort: sort ?? {_id:-1}
            }
            if (pagination == undefined && typeof limit != undefined) {
                options = {
                    lean: true,
                    limit: parseInt(limit),
                    sort: sort ?? { _id: -1 }
                }
            }
            else if (typeof pagination != undefined && typeof limit == undefined) {
                options = {
                    lean: true,
                    skip: parseInt(pagination) * defaultLimit,
                    limit: defaultLimit,
                    sort: sort ?? { _id: -1 }
                }
            }
            else if (typeof pagination != undefined && typeof limit != undefined) {
                options = {
                    lean: true,
                    skip: parseInt(pagination) * parseInt(limit),
                    limit: parseInt(limit),
                    sort: sort ?? { _id: -1 }
                }
            }
            return options;

        }
        catch (err) {
            throw err;
        }
    }

    static hashPass = async (password: string) => {
        try {
            let response = await bcrypt.hash(password, Number(SALT_ROUND));
            return response;

        }
        catch (err) {
            throw err;
        }
    }

    static comparePass = async (hashPass: string, password: string) => {
        try {
            let response = await bcrypt.compare(password, hashPass);
            return response;
        }
        catch (err) {
            throw err;
        }
    }

    static generateOtp = async () => {
        try {
            let options = {
                length:4,
                charset: 'numeric'
            }
            let response = random.generate(options);
            return response;
        }
        catch (err) {
            throw err;
        }
    }

    static generateUniqueCode = async () => {
        try {
            let options = {
                length: 6,
                charset: 'alphabetic'
            }
            let response = random.generate(options);
            return response;
        }
        catch (err) {
            throw err;
        }
    }


    static signToken = async (data: any) => {
        try {
            data.tokenGenAt = moment().utc().valueOf();
            let token = await jwt.sign(data, String(SECRET_KEY));
            await this.saveSession(token, data)
            return token;
        }
        catch (err) {
            throw err;
        }
    }

    static saveSession = async (token: string, data: any) => {
        try {
            let { _id, tokenGenAt } = data
            let saveData: any = {
                accessToken: token,
                tokenGenAt: tokenGenAt,
                userId: _id
            }
            let response = await Models.sessionModel.create(saveData);
            return response;

        }
        catch (err) {
            throw err;
        }
    }

    static verifyToken = async (token: string) => {
        try {
            let data = await jwt.verify(token, String(SECRET_KEY))
            let checkSession = await this.checkSessionData(data);
            if (!checkSession) await Handler.handleCustomError(Unauthorized);
            return data;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static checkSessionData = async (data: any) => {
        try {
            let { _id } = data;
            let query: any = { userId: new Types.ObjectId(_id) };
            let projection = { __v: 0 }
            let option = { lean: true }
            let response = await Models.sessionModel.findOne(query, projection, option);
            return response;
        }
        catch (err) {
            throw err;
        }
    }

    static fetchUser = async (query: any) => {
        try {
            let projection = { __v: 0, password:0 }
            let option = { lean: true }
            let data = await Models.userModel.findOne(query, projection, option);
            return data;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }


}