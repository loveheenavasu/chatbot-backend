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
exports.fetchUser = exports.verifyToken = exports.signToken = exports.generateUniqueCode = exports.generateOtp = exports.comparePassword = exports.hashPassword = exports.setOptions = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
const Models = __importStar(require("../models/index"));
const mongoose_1 = require("mongoose");
const randomstring_1 = __importDefault(require("randomstring"));
const Handler = __importStar(require("../handler/handler"));
const error_1 = require("../handler/error");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { SALT_ROUND, SECRET_KEY } = process.env;
const projection = { __v: 0 };
const option = { lean: true };
const setOptions = (pagination = 1, limit = 10, sort = { _id: -1 }) => {
    try {
        const options = {
            lean: true,
            skip: (pagination - 1) * limit,
            limit: Number(limit),
            sort,
        };
        return options;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
};
exports.setOptions = setOptions;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield bcrypt_1.default.hash(password, Number(SALT_ROUND));
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.hashPassword = hashPassword;
const comparePassword = (hashPassword, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield bcrypt_1.default.compare(password, hashPassword);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.comparePassword = comparePassword;
const generateOtp = () => {
    try {
        const options = {
            length: 4,
            charset: 'numeric'
        };
        const response = randomstring_1.default.generate(options);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
};
exports.generateOtp = generateOtp;
const generateUniqueCode = () => {
    try {
        const options = {
            length: 6,
            charset: 'alphabetic'
        };
        const response = randomstring_1.default.generate(options);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
};
exports.generateUniqueCode = generateUniqueCode;
const signToken = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        data.tokenGenAt = (0, moment_1.default)().utc().valueOf();
        const token = jwt.sign(data, String(SECRET_KEY), { expiresIn: '30m' });
        yield saveSession(token, data);
        return token;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.signToken = signToken;
const saveSession = (token, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, tokenGenAt } = data;
        const saveData = {
            accessToken: token,
            tokenGenAt: tokenGenAt,
            userId: _id
        };
        const response = yield Models.sessionModel.create(saveData);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = jwt.verify(token, String(SECRET_KEY));
        const checkSession = yield checkSessionData(data);
        if (!checkSession)
            return Handler.handleCustomError(error_1.Unauthorized);
        return data;
    }
    catch (err) {
        if ((err === null || err === void 0 ? void 0 : err.message) == "jwt expired") {
            yield Models.sessionModel.deleteOne({ accessToken: token });
            return Handler.handleCustomError(error_1.InvalidToken);
        }
        return Handler.handleCustomError(err);
    }
});
exports.verifyToken = verifyToken;
const checkSessionData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = { userId: new mongoose_1.Types.ObjectId(data._id) };
        const response = yield Models.sessionModel.findOne(query, projection, option);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const fetchUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projection = { __v: 0, password: 0 };
        const data = yield Models.userModel.findOne(query, projection, option);
        return data;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.fetchUser = fetchUser;
