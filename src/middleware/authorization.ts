import express from 'express';
import axios from 'axios';
import { config } from 'dotenv';
config();
import * as Models from '../models/index';
import Handler from '../handler/handler';
import jwt from 'jsonwebtoken';
import { BearerToken, InvalidToken, ProvideToken, Unauthorized } from '../handler/error';
import CommonHelper from '../common/common';
import { Types } from 'mongoose';
const { SCOPE } = process.env;


const authorization = async (req: express.Request | any, res: express.Response, next: any) => {
    try {
        let { token } = req.headers;
        if (!token) {
            await Handler.handleCustomError(ProvideToken);
        }
        let splitToken = token.split(' ');
        if (splitToken[0] != 'Bearer') {
            await Handler.handleCustomError(BearerToken)
        }

        let decodeToken: any = await jwt.decode(splitToken[1]);
        if (decodeToken?.scope == SCOPE) {
            let verifyData: any = await CommonHelper.verifyToken(splitToken[1]);
            if (verifyData) {
                let { _id } = verifyData;
                let query = { _id: new Types.ObjectId(_id) }
                let data: any = await CommonHelper.fetchUser(query);
                if (data?.otp == null && data?.isEmailVerified != true) {
                    await Handler.handleCustomError(Unauthorized);
                }
                delete data.otp;
                data.accessToken = splitToken[1];
                req.userData = data;
                next();
            }
            else {
                await Handler.handleCustomError(Unauthorized);
            }
        }
        else {
            try {
                const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${splitToken[1]}`;
                let response: any;
                response = await axios.get(url);
                // let decodeToken: any = await jwt.decode(splitToken[1]);
                // const currentTime = Math.floor(Date.now() / 1000);
                // console.log("currentTime----", currentTime);
                // console.log("tokenInfo?.exp", tokenInfo?.exp); // Current time in seconds

                // if (decodeToken?.exp < currentTime) {
                //     await Handler.handleCustomError(InvalidToken);
                // }
                const tokenInfo = response?.data;
                let query = { email: tokenInfo?.email?.toLowerCase() }
                // let query = { email: decodeToken?.email?.toLowerCase() }
                let data: any = await CommonHelper.fetchUser(query);
                delete data.otp;
                data.accessToken = splitToken[1]
                req.userData = data;
                next();
            }
            catch (err: any) {
                if (err?.response?.data.error == "invalid_token") {
                    await Models.sessionModel.deleteOne({ accessToken: splitToken[1] });
                    await Handler.handleCustomError(InvalidToken);
                }
                await Handler.handleCustomError(err);
            }
        }
    }
    catch (err) {
        await Handler.handleCatchError(res, err);
    }
};

// const authorization = async (req: express.Request | any, res: express.Response, next: any) => {
//     try {
//         let { token } = req.headers;
//         // console.log("token---",token)
//         if (!token) {
//             await Handler.handleCustomError(ProvideToken);
//         }

//         let splitToken = token.split(' ');
//         if (splitToken[0] != 'Bearer') {
//             await Handler.handleCustomError(BearerToken)
//         }
//         const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${splitToken[1]}`;
//         let response: any;
//         try {
//             response = await axios.get(url);
//             // let decodeToken: any = await jwt.decode(splitToken[1]);
//             // const currentTime = Math.floor(Date.now() / 1000);
//             // console.log("currentTime----", currentTime);
//             // console.log("tokenInfo?.exp", tokenInfo?.exp); // Current time in seconds

//             // if (decodeToken?.exp < currentTime) {
//             //     await Handler.handleCustomError(InvalidToken);
//             // }
//             const tokenInfo = response?.data;
//             let query = { email: tokenInfo?.email?.toLowerCase() }
//             // let query = { email: decodeToken?.email?.toLowerCase() }
//             let projection = { __v: 0, createdAt: 0, updatedAt: 0 }
//             let option = { lean: true }
//             let data = await Models.userModel.findOne(query, projection, option);
//             let userdata: any = data
//             userdata.accessToken = splitToken[1]
//             req.userData = data;
//             next();

//         } catch (err: any) {
//             await Models.sessionModel.deleteOne({ accessToken: splitToken[1] });
//             if (err?.response?.data.error == "invalid_token") {
//                 await Handler.handleCustomError(InvalidToken);
//             }
//             await Handler.handleCustomError(err);
//         }

//     }
//     catch (err) {
//         await Handler.handleCatchError(res, err);
//     }
// };

export {
    authorization
};
