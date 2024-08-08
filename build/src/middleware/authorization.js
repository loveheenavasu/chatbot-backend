"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const axios_1 = __importDefault(require("axios"));
const Models = __importStar(require("../models/index"));
const Handler = __importStar(require("../handler/handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../handler/error");
const CommonHelper = __importStar(require("../common/common"));
const mongoose_1 = require("mongoose");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const SCOPE = process.env.SCOPE;
const URL = process.env.VERIFY_GOOGLE_TOKEN_URL;
const authorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.headers;
        if (!token)
            return Handler.handleCustomError(error_1.ProvideToken);
        const [scheme, tokenValue] = token.split(' ');
        if (scheme != 'Bearer')
            return Handler.handleCustomError(error_1.BearerToken);
        const decodeToken = jsonwebtoken_1.default.decode(tokenValue);
        if (decodeToken.scope == SCOPE) {
            const verifyData = yield CommonHelper.verifyToken(tokenValue);
            if (verifyData) {
                const query = { _id: new mongoose_1.Types.ObjectId(verifyData._id) };
                const user = yield CommonHelper.fetchUser(query);
                if (user) {
                    if (user.otp == null && user.isEmailVerified != true) {
                        return Handler.handleCustomError(error_1.Unauthorized);
                    }
                    delete user.otp;
                    user.accessToken = tokenValue;
                    req.userData = user;
                    next();
                }
                else {
                    return Handler.handleCustomError(error_1.Unauthorized);
                }
            }
            else {
                return Handler.handleCustomError(error_1.Unauthorized);
            }
        }
        else {
            try {
                const url = `${URL}${tokenValue}`;
                const response = yield axios_1.default.get(url);
                const lowerCaseEmail = response.data.email.toLowerCase();
                const query = { email: lowerCaseEmail };
                const data = yield CommonHelper.fetchUser(query);
                if (data) {
                    delete data.otp;
                    data.accessToken = tokenValue;
                    req.userData = data;
                    next();
                }
                else {
                    return Handler.handleCustomError(error_1.Unauthorized);
                }
            }
            catch (err) {
                if (err.response.data.error == "invalid_token") {
                    yield Models.sessionModel.deleteOne({ accessToken: tokenValue });
                    return Handler.handleCustomError(error_1.InvalidToken);
                }
                return Handler.handleCustomError(err);
            }
        }
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.authorization = authorization;
