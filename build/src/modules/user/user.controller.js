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
const user_service_1 = __importDefault(require("./user.service"));
const handler_1 = __importDefault(require("../../handler/handler"));
class Controller {
}
_a = Controller;
Controller.signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.signup(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.verifyEmail(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.resendOtp(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.forgotPassword(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.verifyOtp(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.resetPassword(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.login(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.profile(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.socialLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.socialLogin(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.chatbotLists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.chatbotLists(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.deleteChatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.deleteChatbot(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.saveTexts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.saveTexts(req);
        handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.updateTexts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.updateTexts(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.textDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.textDetail(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.textExtract = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.textExtract(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.fileLists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.fileLists(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.deleteFile(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
Controller.logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield user_service_1.default.logout(req);
        yield handler_1.default.handleSuccess(res, response);
    }
    catch (err) {
        yield handler_1.default.handleCatchError(res, err);
    }
});
exports.default = Controller;
