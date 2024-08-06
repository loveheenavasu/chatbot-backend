import * as Handler from "../handler/handler"
import path from 'path';
import fs from 'fs';
import { sendEmail } from "./utility/email";
import { IErrorResponse } from "../handler/error";


const verificationCode = async (email: string, otp: string) => {
    try {
        let subject = "OTP Verification";
        let filepath = path.join(__dirname, '../email-templates/verify-code.html');
        let html = fs.readFileSync(filepath, { encoding: 'utf-8' });
        html = html.replace('VERIFICATION_CODE', otp?.toString());
        await sendEmail(email, subject, html)
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

export {
    verificationCode
}