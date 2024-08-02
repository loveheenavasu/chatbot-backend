import Handler from "../handler/handler"
import path from 'path';
import fs from 'fs';
import { sendEmail } from "./email";

export default class EmailService {

    static verificationCode = async (email: string, otp: string) => {
        try {
            let subject = "OTP Verification";
            let filepath = path.join(__dirname, '../email-templates/verify-code.html');
            let html = fs.readFileSync(filepath, { encoding: 'utf-8' });
            html = html.replace('VERIFICATION_CODE', otp);
            await sendEmail(email,subject, html)
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }
}