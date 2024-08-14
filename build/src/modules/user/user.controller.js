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
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeList = exports.createTheme = exports.chatDetail = exports.chatHistory = exports.logout = exports.deleteFile = exports.fileLists = exports.textExtract = exports.textDetail = exports.updateTexts = exports.saveTexts = exports.deleteChatbot = exports.chatbotLists = exports.socialLogin = exports.login = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.resendOtp = exports.verifyEmail = exports.signup = void 0;
const Service = __importStar(require("./user.service"));
const Handler = __importStar(require("../../handler/handler"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.signup(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.signup = signup;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.verifyEmail(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.verifyEmail = verifyEmail;
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.resendOtp(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.resendOtp = resendOtp;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.forgotPassword(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.forgotPassword = forgotPassword;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.verifyOtp(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.verifyOtp = verifyOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.resetPassword(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.resetPassword = resetPassword;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.login(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.login = login;
const socialLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.socialLogin(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.socialLogin = socialLogin;
const chatbotLists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.chatbotLists(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.chatbotLists = chatbotLists;
const deleteChatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.deleteChatbot(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.deleteChatbot = deleteChatbot;
const saveTexts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.saveTexts(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.saveTexts = saveTexts;
const updateTexts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.updateTexts(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.updateTexts = updateTexts;
const textDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.textDetail(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.textDetail = textDetail;
const textExtract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.textExtract(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.textExtract = textExtract;
const fileLists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.fileLists(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.fileLists = fileLists;
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.deleteFile(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.deleteFile = deleteFile;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.logout(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.logout = logout;
const chatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.chatHistory(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.chatHistory = chatHistory;
const chatDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.chatDetail(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.chatDetail = chatDetail;
const createTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.createTheme(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.createTheme = createTheme;
const themeList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield Service.themeList(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err);
    }
});
exports.themeList = themeList;
