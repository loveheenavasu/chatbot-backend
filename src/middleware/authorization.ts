import { NextFunction, Response } from 'express';
import axios from 'axios';
import * as Models from '../models/index';
import * as Handler from '../handler/handler';
import jwt from 'jsonwebtoken';
import { BearerToken, ErrorResponse, InvalidToken, ProvideToken, Unauthorized } from '../handler/error';
import * as CommonHelper from '../common/common';
import { Types } from 'mongoose';
import { CustomRequest, Token } from '../interfaces/common.interface';
import { config } from 'dotenv';
config();
const SCOPE = process.env.SCOPE as String;
const URL = process.env.VERIFY_GOOGLE_TOKEN_URL as String;


const authorization = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { token } = req.headers;
        if (!token) return Handler.handleCustomError(ProvideToken);

        const [scheme, tokenValue] = (token as string).split(' ');

        if (scheme != 'Bearer') return Handler.handleCustomError(BearerToken);

        const decodeToken = jwt.decode(tokenValue) as Token;
        if (decodeToken.scope == SCOPE) {
            const verifyData = await CommonHelper.verifyToken(tokenValue);
            if (verifyData) {
                const query = { _id: new Types.ObjectId(verifyData._id) }
                const user = await CommonHelper.fetchUser(query);
                if (user) {
                    if (user.otp == null && user.isEmailVerified != true) {
                        return Handler.handleCustomError(Unauthorized);
                    }
                    delete user.otp;
                    user.accessToken = tokenValue;
                    req.userData = user;
                    next();
                }
                else {
                    return Handler.handleCustomError(Unauthorized);
                }
            }
            else {
                return Handler.handleCustomError(Unauthorized);
            }
        }
        else {
            try {
                const url = `${URL}${tokenValue}`;
                const response = await axios.get(url);
                const lowerCaseEmail = response.data.email.toLowerCase();
                const query = { email: lowerCaseEmail }
                const data = await CommonHelper.fetchUser(query);
                if (data) {
                    delete data.otp;
                    data.accessToken = tokenValue
                    req.userData = data;
                    next();
                }
                else {
                    return Handler.handleCustomError(Unauthorized);
                }
            }
            catch (err: ErrorResponse | any) {
                if (err.response.data.error == "invalid_token") {
                    await Models.sessionModel.deleteOne({ accessToken: tokenValue });
                    return Handler.handleCustomError(InvalidToken);
                }
                return Handler.handleCustomError(err);
            }
        }
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
};

export {
    authorization
};
