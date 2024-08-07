import { NextFunction, Response } from 'express';
import axios from 'axios';
import { config } from 'dotenv';
config();
import * as Models from '../models/index';
import * as Handler from '../handler/handler';
import jwt from 'jsonwebtoken';
import { BearerToken, IErrorResponse, InvalidToken, ProvideToken, Unauthorized } from '../handler/error';
import * as CommonHelper from '../common/common';
import { Types } from 'mongoose';
import { CustomRequest, IToken } from '../interfaces/common.interface';
const { SCOPE } = process.env;

const authorization = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        let { token } = req.headers;
        if (!token) {
            return Handler.handleCustomError(ProvideToken);
        }
        const [scheme, tokenValue] = (token as string).split(' ');

        if (scheme != 'Bearer') {
            return Handler.handleCustomError(BearerToken)
        }

        let decodeToken = jwt.decode(tokenValue) as IToken | null;
        if (decodeToken?.scope == SCOPE) {
            let verifyData = await CommonHelper.verifyToken(tokenValue);
            if (verifyData) {
                let query = { _id: new Types.ObjectId(verifyData?._id) }
                let user = await CommonHelper.fetchUser(query);
                if (user) {
                    if (user?.otp == null && user?.isEmailVerified != true) {
                        return Handler.handleCustomError(Unauthorized);
                    }
                    delete user?.otp;
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
                const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenValue}`;
                let response;
                response = await axios.get(url);
                const tokenInfo = response?.data;
                let query = { email: tokenInfo?.email?.toLowerCase() }
                let data = await CommonHelper.fetchUser(query);
                if (data) {
                    delete data?.otp;
                    data!.accessToken = tokenValue
                    req.userData = data;
                    next();
                }
                else {
                    return Handler.handleCustomError(Unauthorized);
                }
            }
            catch (err: IErrorResponse | any) {
                if (err?.response?.data?.error == "invalid_token") {
                    await Models.sessionModel.deleteOne({ accessToken: tokenValue });
                    return Handler.handleCustomError(InvalidToken);
                }
                return Handler.handleCustomError(err);
            }
        }
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
};

export {
    authorization
};
