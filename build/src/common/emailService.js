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
const handler_1 = __importDefault(require("../handler/handler"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const email_1 = require("./email");
class EmailService {
}
_a = EmailService;
EmailService.verificationCode = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let subject = "OTP Verification";
        let filepath = path_1.default.join(__dirname, '../email-templates/verify-code.html');
        let html = fs_1.default.readFileSync(filepath, { encoding: 'utf-8' });
        html = html.replace('VERIFICATION_CODE', otp);
        yield (0, email_1.sendEmail)(email, subject, html);
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
exports.default = EmailService;
