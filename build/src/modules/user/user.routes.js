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
router.post('/login', user_controller_1.default.login);
router.get('/chatbot', authorization_1.authorization, user_controller_1.default.chatbotLists);
router.delete('/chatbot', authorization_1.authorization, user_controller_1.default.deleteChatbot);
router.post('/text', authorization_1.authorization, user_controller_1.default.saveTexts);
router.patch('/text', authorization_1.authorization, user_controller_1.default.updateTexts);
router.get('/text', authorization_1.authorization, user_controller_1.default.textDetail);
router.post('/upload', authorization_1.authorization, upload.single('file'), user_controller_1.default.textExtract);
router.get('/files', authorization_1.authorization, user_controller_1.default.fileLists);
router.delete('/files', authorization_1.authorization, user_controller_1.default.deleteFile);
router.delete('/logout', authorization_1.authorization, user_controller_1.default.logout);
exports.default = router;
