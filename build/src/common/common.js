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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const jwt = __importStar(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
const Models = __importStar(require("../models/index"));
const mongoose_1 = require("mongoose");
const randomstring_1 = __importDefault(require("randomstring"));
const handler_1 = __importDefault(require("../handler/handler"));
const error_1 = require("../handler/error");
const { SALT_ROUND, SECRET_KEY } = process.env;
class CommonHelper {
}
_a = CommonHelper;
CommonHelper.setOptions = (pagination, limit, sort) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const defaultLimit = 10;
        let options = {
            lean: true,
            sort: sort !== null && sort !== void 0 ? sort : { _id: -1 }
        };
        if (pagination == undefined && typeof limit != undefined) {
            options = {
                lean: true,
                limit: parseInt(limit),
                sort: sort !== null && sort !== void 0 ? sort : { _id: -1 }
            };
        }
        else if (typeof pagination != undefined && typeof limit == undefined) {
            options = {
                lean: true,
                skip: parseInt(pagination) * defaultLimit,
                limit: defaultLimit,
                sort: sort !== null && sort !== void 0 ? sort : { _id: -1 }
            };
        }
        else if (typeof pagination != undefined && typeof limit != undefined) {
            options = {
                lean: true,
                skip: parseInt(pagination) * parseInt(limit),
                limit: parseInt(limit),
                sort: sort !== null && sort !== void 0 ? sort : { _id: -1 }
            };
        }
        return options;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.hashPass = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield bcrypt_1.default.hash(password, Number(SALT_ROUND));
        return response;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.comparePass = (hashPass, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield bcrypt_1.default.compare(password, hashPass);
        return response;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.generateOtp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let options = {
            length: 4,
            charset: 'numeric'
        };
        let response = randomstring_1.default.generate(options);
        return response;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.generateUniqueCode = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let options = {
            length: 6,
            charset: 'alphabetic'
        };
        let response = randomstring_1.default.generate(options);
        return response;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.signToken = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        data.tokenGenAt = (0, moment_1.default)().utc().valueOf();
        let token = yield jwt.sign(data, String(SECRET_KEY));
        yield _a.saveSession(token, data);
        return token;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.saveSession = (token, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { _id, tokenGenAt } = data;
        let saveData = {
            accessToken: token,
            tokenGenAt: tokenGenAt,
            userId: _id
        };
        let response = yield Models.sessionModel.create(saveData);
        return response;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield jwt.verify(token, String(SECRET_KEY));
        let checkSession = yield _a.checkSessionData(data);
        if (!checkSession)
            yield handler_1.default.handleCustomError(error_1.Unauthorized);
        return data;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
CommonHelper.checkSessionData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { _id } = data;
        let query = { userId: new mongoose_1.Types.ObjectId(_id) };
        let projection = { __v: 0 };
        let option = { lean: true };
        let response = yield Models.sessionModel.findOne(query, projection, option);
        return response;
    }
    catch (err) {
        throw err;
    }
});
CommonHelper.fetchUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let projection = { __v: 0, password: 0 };
        let option = { lean: true };
        let data = yield Models.userModel.findOne(query, projection, option);
        return data;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
exports.default = CommonHelper;
