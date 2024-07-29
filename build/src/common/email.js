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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
const handler_1 = __importDefault(require("../handler/handler"));
(0, dotenv_1.config)();
const { NODEMAILER_EMAIL, NODEMAILER_PASSWORD } = process.env;
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    // secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD,
    },
});
const sendEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, otp } = data;
        const mailOptions = {
            from: NODEMAILER_EMAIL,
            to: email,
            subject: "Otp Verification",
            text: `${otp} is your verification code.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error---", error);
            }
            if (info) {
                console.log("email sent", info === null || info === void 0 ? void 0 : info.response);
            }
        });
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
exports.sendEmail = sendEmail;
