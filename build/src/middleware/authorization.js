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
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const Models = __importStar(require("../models/index"));
const Handler = __importStar(require("../handler/handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../handler/error");
const CommonHelper = __importStar(require("../common/common"));
const mongoose_1 = require("mongoose");
const { SCOPE } = process.env;
const authorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        let { token } = req.headers;
        if (!token) {
            return Handler.handleCustomError(error_1.ProvideToken);
        }
        const [scheme, tokenValue] = token.split(' ');
        if (scheme != 'Bearer') {
            return Handler.handleCustomError(error_1.BearerToken);
        }
        let decodeToken = jsonwebtoken_1.default.decode(tokenValue);
        if ((decodeToken === null || decodeToken === void 0 ? void 0 : decodeToken.scope) == SCOPE) {
            let verifyData = yield CommonHelper.verifyToken(tokenValue);
            if (verifyData) {
                let query = { _id: new mongoose_1.Types.ObjectId(verifyData === null || verifyData === void 0 ? void 0 : verifyData._id) };
                let user = yield CommonHelper.fetchUser(query);
                if (user) {
                    if ((user === null || user === void 0 ? void 0 : user.otp) == null && (user === null || user === void 0 ? void 0 : user.isEmailVerified) != true) {
                        return Handler.handleCustomError(error_1.Unauthorized);
                    }
                    user === null || user === void 0 ? true : delete user.otp;
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
                const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenValue}`;
                let response;
                response = yield axios_1.default.get(url);
                const tokenInfo = response === null || response === void 0 ? void 0 : response.data;
                let query = { email: (_a = tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.email) === null || _a === void 0 ? void 0 : _a.toLowerCase() };
                let data = yield CommonHelper.fetchUser(query);
                if (data) {
                    data === null || data === void 0 ? true : delete data.otp;
                    data.accessToken = tokenValue;
                    req.userData = data;
                    next();
                }
                else {
                    return Handler.handleCustomError(error_1.Unauthorized);
                }
            }
            catch (err) {
                if (((_c = (_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) == "invalid_token") {
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
