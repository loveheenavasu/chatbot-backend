import express from 'express';
import axios from 'axios';
import { config } from 'dotenv';
config();
const { CLIENT_ID } = process.env;
import * as Models from '../models/index';
import Handler from '../handler/handler';
import jwt from 'jsonwebtoken';
import { BearerToken, InvalidToken, ProvideToken } from '../handler/error';

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

        const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${splitToken[1]}`;
        let response: any;
        try {
            response = await axios.get(url);
            // let decodeToken: any = await jwt.decode(splitToken[1]);
            // console.log("decodeToken----", decodeToken)
            // const currentTime = Math.floor(Date.now() / 1000);
            // console.log("currentTime----", currentTime);
            // console.log("tokenInfo?.exp", tokenInfo?.exp); // Current time in seconds

            // if (decodeToken?.exp < currentTime) {
            //     await Handler.handleCustomError(InvalidToken);
            const tokenInfo = response?.data;
            let query = { email: tokenInfo?.email?.toLowerCase() }
            let projection = { __v: 0, createdAt: 0, updatedAt: 0 }
            let option = { lean: true }
            let data: any = await Models.userModel.findOne(query, projection, option);
            data.socialToken = splitToken[1]
            req.userData = data;
            next();

        } catch (err: any) {
            await Models.sessionModel.deleteOne({ socialToken: splitToken[1] });
            await Handler.handleCustomError(InvalidToken);
        }
        
    }
    catch (err) {
        await Handler.handleCatchError(res, err);
    }
};

export {
    authorization
};
