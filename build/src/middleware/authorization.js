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
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { CLIENT_ID } = process.env;
const Models = __importStar(require("../models/index"));
const handler_1 = __importDefault(require("../handler/handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../handler/error");
const authorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let { token } = req.headers;
        let apiPath = req.originalUrl;
        // console.log("apiPath----", apiPath);
        // console.log("authorization---", token);
        if (!token) {
            // return res.status(400).send({ message: 'Provide token' });
            yield handler_1.default.handleCustomError(error_1.ProvideToken);
        }
        let splitToken = token.split(' ');
        // console.log("split token----", splitToken)
        if (splitToken[0] != 'Bearer') {
            yield handler_1.default.handleCustomError(error_1.BearerToken);
        }
        // const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${splitToken[1]}`;
        let response;
        try {
            // response = await axios.get(url);
            let decodeToken = yield jsonwebtoken_1.default.decode(splitToken[1]);
            console.log("decodeToken----", decodeToken);
            const currentTime = Math.floor(Date.now() / 1000);
            console.log("currentTime----", currentTime);
            // console.log("tokenInfo?.exp", tokenInfo?.exp); // Current time in seconds
            // if (decodeToken?.exp < currentTime) {
            //     await Handler.handleCustomError(InvalidToken);
            // }
            let query = { email: (_a = decodeToken === null || decodeToken === void 0 ? void 0 : decodeToken.email) === null || _a === void 0 ? void 0 : _a.toLowerCase() };
            let projection = { __v: 0, createdAt: 0, updatedAt: 0 };
            let option = { lean: true };
            let data = yield Models.userModel.findOne(query, projection, option);
            data.socialToken = splitToken[1];
            req.userData = data;
            next();
        }
        catch (err) {
            console.error('Error fetching token info:', ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
            yield Models.sessionModel.deleteOne({ socialToken: splitToken[1] });
            // return res.status(400).send({ message: 'Invalid token' });
            yield handler_1.default.handleCustomError(error_1.InvalidToken);
        }
        // const tokenInfo = response?.data;
        // console.log("tokenInfo----", tokenInfo);
        // // Perform checks to ensure the token is valid
        // if (tokenInfo.aud !== CLIENT_ID) {
        //     // return res.status(400).send({ message: 'Token audience mismatch' });
        //     await Handler.handleCustomError(TokenMismatch);
        // }
    }
    catch (err) {
        console.log("auth err---", err);
        yield handler_1.default.handleCatchError(res, err);
        // console.error('Error in authorization middleware:', err);
        // res.status(500).send({ message: 'Internal server error' });
    }
});
exports.authorization = authorization;
