import bcrypt from 'bcrypt';
import { config } from 'dotenv';
config();
const { SALT_ROUND, SECRET_KEY, CLIENT_ID } = process.env;

console.log("salt round---", SALT_ROUND);
console.log("secret key----", SECRET_KEY);
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import * as Models from '../models/index';
import { Types } from 'mongoose';
import axios from 'axios';

export default class CommonHelper {

    static setOptions = async (pagination: any, limit: any, sort:any) => {
        try {
            //     let setPagination = typeof(pagination) ?? 1;
            //     let setLimit = typeof(limit) ?? 10;
            //     let options = {
            //         lean: true,
            //         skip: parseInt(setPagination) * parseInt(setLimit),
            //         limit: setLimit,
            //         sort: { _id: -1 }
            //     }
            //     return options;
            const defaultLimit = 10
            let options: any = {
                lean: true,
                sort: sort
            }
            if (pagination == undefined && typeof limit != undefined) {
                options = {
                    lean: true,
                    limit: parseInt(limit),
                    sort: sort
                }
            }
            else if (typeof pagination != undefined && typeof limit == undefined) {
                options = {
                    lean: true,
                    skip: parseInt(pagination) * defaultLimit,
                    limit: defaultLimit,
                    sort: sort
                }
            }
            else if (typeof pagination != undefined && typeof limit != undefined) {
                options = {
                    lean: true,
                    skip: parseInt(pagination) * parseInt(limit),
                    limit: parseInt(limit),
                    sort: sort
                }
            }
            return options;

        }
        catch (err) {
            throw err;
        }
    }

    // static setOptions = async (pagination: any, limit: any) => {
    //     try {
    //     //     let setPagination = typeof(pagination) ?? 1;
    //     //     let setLimit = typeof(limit) ?? 10;
    //     //     let options = {
    //     //         lean: true,
    //     //         skip: parseInt(setPagination) * parseInt(setLimit),
    //     //         limit: setLimit,
    //     //         sort: { _id: -1 }
    //     //     }
    //     //     return options;
    //         const defaultLimit = 10
    //         let options :any= {
    //             lean: true,
    //             sort:{_id:-1}
    //         }
    //         if (pagination == undefined && typeof limit != undefined) {
    //             options = {
    //                 lean: true,
    //                 limit: parseInt(limit),
    //                 sort: { _id: -1 }
    //             }
    //         }
    //         else if (typeof pagination != undefined && typeof limit == undefined) {
    //             options = {
    //                 lean: true,
    //                 skip: parseInt(pagination) * defaultLimit,
    //                 limit:defaultLimit,
    //                 sort: { _id: -1 }
    //             }
    //         }
    //         else if (typeof pagination != undefined && typeof limit != undefined) {
    //             options = {
    //                 lean: true,
    //                 skip: parseInt(pagination) * parseInt(limit),
    //                 limit: parseInt(limit),
    //                 sort: { _id: -1 }
    //             }
    //         }
    //         return options;

    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }
    // static hashPass = async (password: string) => {
    //     try {
    //         let response = await bcrypt.hash(password, Number(SALT_ROUND));
    //         return response;

    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }

    // static comparePass = async (hashPass: string, password: string) => {
    //     try {
    //         let response = await bcrypt.compare(password, hashPass);
    //         return response;
    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }


    // static signToken = async (data: any) => {
    //     try {
    //         data.tokenGenAt = moment().utc().valueOf();
    //         let token = await jwt.sign(data, String(SECRET_KEY));
    //         await this.saveSession(token, data)
    //         return token;
    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }

    // static saveSession = async (token: string, data: any) => {
    //     try {
    //         let { _id, type, tokenGenAt } = data
    //         let saveData: any = {
    //             accessToken: token,
    //             tokenGenAt: tokenGenAt
    //         }
    //         if (type == "Admin") {
    //             saveData.adminId = _id
    //         }
    //         else {
    //             saveData.userId = _id
    //         }
    //         let response = await Models.sessionModel.create(saveData);
    //         return response;

    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }

    // static verifyToken = async (token: string) => {
    //     try {
    //         let data = await jwt.verify(token, String(SECRET_KEY))
    //         let checkSession = await this.checkSessionData(data);
    //         // if (!checkSession) throw new Unauthorized();
    //         return data;
    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }

    // static checkSessionData = async (data: any) => {
    //     try {
    //         let { type, _id } = data;
    //         let query: any = { userId: new Types.ObjectId(_id) };
    //         if (type == 'Admin') query = { adminId: new Types.ObjectId(_id) };
    //         let projection = { __v: 0 }
    //         let option = { lean: true }
    //         let response = await Models.sessionModel.findOne(query, projection, option);
    //         return response;
    //     }
    //     catch (err) {
    //         throw err;
    //     }
    // }


}