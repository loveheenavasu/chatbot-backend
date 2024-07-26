"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotModel = exports.messageModel = exports.sessionModel = exports.userModel = exports.textModel = void 0;
const user_model_1 = __importDefault(require("./user.model"));
exports.userModel = user_model_1.default;
const text_model_1 = __importDefault(require("./text.model"));
exports.textModel = text_model_1.default;
const session_model_1 = __importDefault(require("./session.model"));
exports.sessionModel = session_model_1.default;
const message_model_1 = __importDefault(require("./message.model"));
exports.messageModel = message_model_1.default;
const chatbot_model_1 = __importDefault(require("./chatbot.model"));
exports.chatbotModel = chatbot_model_1.default;
