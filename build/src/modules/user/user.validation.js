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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeCreate = exports.uploadFile = exports.updateText = exports.text = exports.deleteFile = exports.sessionIdWithPL = exports.documentIdWithPL = exports.textDetail = exports.documentId = exports.socialLogin = exports.login = exports.resetPassword = exports.verifyForgot = exports.resendAndForgot = exports.verify = exports.signup = void 0;
const Handler = __importStar(require("../../handler/handler"));
const joi_1 = __importDefault(require("joi"));
const signup = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: joi_1.default.string().min(8).required(),
            firstname: joi_1.default.string().trim().required(),
            lastname: joi_1.default.string().trim().optional()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.signup = signup;
const verify = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            otp: joi_1.default.string().required()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.verify = verify;
const resendAndForgot = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.resendAndForgot = resendAndForgot;
const verifyForgot = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            otp: joi_1.default.string().required()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.verifyForgot = verifyForgot;
const resetPassword = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            uniqueCode: joi_1.default.string().trim().required(),
            password: joi_1.default.string().min(8).required()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.resetPassword = resetPassword;
const login = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: joi_1.default.string().min(8).required()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.login = login;
const socialLogin = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            firstname: joi_1.default.string().trim().required(),
            lastname: joi_1.default.string().trim().optional(),
            name: joi_1.default.string().trim().optional(),
            image: joi_1.default.string().trim().optional(),
            isAdmin: joi_1.default.boolean().optional(),
            socialToken: joi_1.default.string().trim().optional()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.socialLogin = socialLogin;
const documentId = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().required()
        });
        const { error } = schema.validate(req.query);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.documentId = documentId;
const textDetail = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().optional()
        });
        const { error } = schema.validate(req.query);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.textDetail = textDetail;
const documentIdWithPL = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().optional(),
            pagination: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional()
        });
        const { error } = schema.validate(req.query);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.documentIdWithPL = documentIdWithPL;
const sessionIdWithPL = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            sessionId: joi_1.default.string().trim().required(),
            pagination: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional()
        });
        const { error } = schema.validate(req.query);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.sessionIdWithPL = sessionIdWithPL;
const deleteFile = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().required(),
            docNo: joi_1.default.number().required()
        });
        const { error } = schema.validate(req.query);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.deleteFile = deleteFile;
const text = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            text: joi_1.default.string().trim().required(),
            documentId: joi_1.default.string().trim().optional()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.text = text;
const updateText = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            text: joi_1.default.string().trim().required(),
            _id: joi_1.default.string().trim().required()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.updateText = updateText;
const uploadFile = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            documentId: joi_1.default.string().optional(),
            file: joi_1.default.object().required()
        });
        const { error } = schema.validate({
            documentId: req.body.documentId,
            file: req.file
        });
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.uploadFile = uploadFile;
const themeCreate = (req, res, next) => {
    try {
        const schema = joi_1.default.object({
            theme: joi_1.default.string().trim().required()
        });
        const { error } = schema.validate(req.body);
        if (error)
            return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
};
exports.themeCreate = themeCreate;
