"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./user.controller"));
const authorization_1 = require("../../middleware/authorization");
const router = express_1.default.Router();
const multer_1 = __importDefault(require("multer"));
const user_validation_1 = __importDefault(require("./user.validation"));
// const upload = multer({ dest: 'src/uploads/' });
const upload = (0, multer_1.default)();
router.post('/signup', user_validation_1.default.signup, user_controller_1.default.signup);
router.post('/verify', user_validation_1.default.verify, authorization_1.authorization, user_controller_1.default.verifyEmail);
router.post('/resend', user_validation_1.default.resendAndForgot, user_controller_1.default.resendOtp);
router.post('/forgot', user_validation_1.default.resendAndForgot, user_controller_1.default.forgotPassword);
router.post('/verify-otp', user_validation_1.default.verifyForgot, user_controller_1.default.verifyOtp);
router.post('/reset', user_validation_1.default.resetPass, user_controller_1.default.resetPassword);
router.post('/login', user_validation_1.default.login, user_controller_1.default.login);
// router.get('/profile',authorization, Controller.profile)
router.post('/social-login', user_validation_1.default.socialLogin, user_controller_1.default.socialLogin);
router.get('/chatbot', authorization_1.authorization, user_controller_1.default.chatbotLists);
router.delete('/chatbot', user_validation_1.default.documentId, authorization_1.authorization, user_controller_1.default.deleteChatbot);
router.post('/text', user_validation_1.default.text, authorization_1.authorization, user_controller_1.default.saveTexts);
router.patch('/text', user_validation_1.default.updateText, authorization_1.authorization, user_controller_1.default.updateTexts);
router.get('/text', user_validation_1.default.textDetail, authorization_1.authorization, user_controller_1.default.textDetail);
router.post('/upload', upload.single('file'), user_validation_1.default.uploadFile, authorization_1.authorization, user_controller_1.default.textExtract);
router.get('/files', user_validation_1.default.documentIdWithPL, authorization_1.authorization, user_controller_1.default.fileLists);
router.delete('/files', user_validation_1.default.deleteFile, authorization_1.authorization, user_controller_1.default.deleteFile);
router.delete('/logout', authorization_1.authorization, user_controller_1.default.logout);
router.get('/chat-history', user_validation_1.default.documentIdWithPL, authorization_1.authorization, user_controller_1.default.chatHistory);
router.get('/chat', user_validation_1.default.sessionIdWithPL, authorization_1.authorization, user_controller_1.default.chatDetail);
// router.post('/url', Controller.url)
exports.default = router;
