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
// const upload = multer({ dest: 'src/uploads/' });
const upload = (0, multer_1.default)();
router.post('/signup', user_controller_1.default.signup);
router.post('/verify', authorization_1.authorization, user_controller_1.default.verifyEmail);
router.post('/resend', user_controller_1.default.resendOtp);
router.post('/forgot', user_controller_1.default.forgotPassword);
router.post('/verify-otp', user_controller_1.default.verifyOtp);
router.post('/reset', user_controller_1.default.resetPassword);
router.post('/login', user_controller_1.default.login);
// router.get('/profile',authorization, Controller.profile)
router.post('/social-login', user_controller_1.default.socialLogin);
router.get('/chatbot', authorization_1.authorization, user_controller_1.default.chatbotLists);
router.delete('/chatbot', authorization_1.authorization, user_controller_1.default.deleteChatbot);
router.post('/text', authorization_1.authorization, user_controller_1.default.saveTexts);
router.patch('/text', authorization_1.authorization, user_controller_1.default.updateTexts);
router.get('/text', authorization_1.authorization, user_controller_1.default.textDetail);
router.post('/upload', authorization_1.authorization, upload.single('file'), user_controller_1.default.textExtract);
router.get('/files', authorization_1.authorization, user_controller_1.default.fileLists);
router.delete('/files', authorization_1.authorization, user_controller_1.default.deleteFile);
router.delete('/logout', authorization_1.authorization, user_controller_1.default.logout);
router.get('/chat-history', authorization_1.authorization, user_controller_1.default.chatHistory);
router.get('/chat', authorization_1.authorization, user_controller_1.default.chatDetail);
// router.post('/url', Controller.url)
exports.default = router;
