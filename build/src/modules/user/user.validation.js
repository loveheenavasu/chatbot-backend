"use strict";
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
const handler_1 = __importDefault(require("../../handler/handler"));
const joi_1 = __importDefault(require("joi"));
class Validation {
}
_a = Validation;
Validation.signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: joi_1.default.string().min(8).required(),
            firstname: joi_1.default.string().trim().required(),
            lastname: joi_1.default.string().trim().optional()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.verify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            otp: joi_1.default.string().required()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.resendAndForgot = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.verifyForgot = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            otp: joi_1.default.string().required()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.resetPass = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            uniqueCode: joi_1.default.string().trim().required(),
            password: joi_1.default.string().min(8).required()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: joi_1.default.string().min(8).required()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.socialLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            email: joi_1.default.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            firstname: joi_1.default.string().trim().required(),
            lastname: joi_1.default.string().trim().optional(),
            name: joi_1.default.string().trim().optional(),
            image: joi_1.default.string().trim().optional(),
            isAdmin: joi_1.default.boolean().optional(),
            socialToken: joi_1.default.string().trim().optional()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.documentId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().required()
        });
        let { error } = schema.validate(req.query);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.textDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().optional()
        });
        let { error } = schema.validate(req.query);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.documentIdWithPL = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().required(),
            pagination: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional()
        });
        let { error } = schema.validate(req.query);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.sessionIdWithPL = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            sessionId: joi_1.default.string().trim().required(),
            pagination: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional()
        });
        let { error } = schema.validate(req.query);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.deleteFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            documentId: joi_1.default.string().trim().required(),
            docNo: joi_1.default.number().required()
        });
        let { error } = schema.validate(req.query);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.text = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            text: joi_1.default.string().trim().required(),
            documentId: joi_1.default.string().trim().optional()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        console.log("catch--", err);
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.updateText = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let schema = joi_1.default.object({
            text: joi_1.default.string().trim().required(),
            _id: joi_1.default.string().trim().required()
        });
        let { error } = schema.validate(req.body);
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        console.log("catch--", err);
        yield handler_1.default.handleCatchError(res, err);
    }
});
Validation.uploadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            documentId: joi_1.default.string().optional(),
            file: joi_1.default.object().required()
        });
        let { error } = schema.validate({
            documentId: req.body.documentId,
            file: req.file
        });
        if (error)
            yield handler_1.default.handleJoiError(error);
        next();
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
exports.default = Validation;
