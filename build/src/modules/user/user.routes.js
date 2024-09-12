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
const express_1 = __importDefault(require("express"));
const Controller = __importStar(require("./user.controller"));
const authorization_1 = require("../../middleware/authorization");
const multer_1 = __importDefault(require("multer"));
const Validation = __importStar(require("./user.validation"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post('/signup', Validation.signup, Controller.signup);
router.post('/verify', Validation.verify, authorization_1.authorization, Controller.verifyEmail);
router.post('/resend', Validation.resendAndForgot, Controller.resendOtp);
router.post('/forgot', Validation.resendAndForgot, Controller.forgotPassword);
router.post('/verify-otp', Validation.verifyForgot, Controller.verifyOtp);
router.post('/reset', Validation.resetPassword, Controller.resetPassword);
router.post('/login', Validation.login, Controller.login);
router.get('/profile', authorization_1.authorization, Controller.profile);
router.post('/social-login', Validation.socialLogin, Controller.socialLogin);
router.get('/chatbot', authorization_1.authorization, Controller.chatbotLists);
router.delete('/chatbot', Validation.documentId, authorization_1.authorization, Controller.deleteChatbot);
router.post('/text', Validation.text, authorization_1.authorization, Controller.saveTexts);
router.patch('/text', Validation.updateText, authorization_1.authorization, Controller.updateTexts);
router.get('/text', Validation.textDetail, authorization_1.authorization, Controller.textDetail);
router.post('/upload', upload.single('file'), Validation.uploadFile, authorization_1.authorization, Controller.textExtract);
router.get('/files', Validation.documentIdWithPL, authorization_1.authorization, Controller.fileLists);
router.delete('/files', Validation.deleteFile, authorization_1.authorization, Controller.deleteFile);
router.delete('/logout', authorization_1.authorization, Controller.logout);
router.get('/chat-history', Validation.documentIdWithPL, authorization_1.authorization, Controller.chatHistory);
router.get('/chat-history-export', Validation.documentIdWithPL, authorization_1.authorization, Controller.chatHistoryExport);
router.get('/chat', Validation.sessionIdWithPL, authorization_1.authorization, Controller.chatDetail);
router.post('/theme', Validation.themeCreate, Controller.createTheme);
router.get('/theme', Controller.themeList);
router.post('/form', Validation.formAdd, authorization_1.authorization, Controller.formAdd);
router.put('/form', Validation.formUpdate, authorization_1.authorization, Controller.formUpdate);
router.get('/form', Validation.documentId, authorization_1.authorization, Controller.formDetail);
router.get('/form-chatbot', Validation.documentId, Controller.formChatbot);
router.get('/form-ip', Validation.documentId, Controller.formWithIp);
router.post('/form-info', Validation.formInfoAdd, Controller.formInfoAdd);
exports.default = router;
