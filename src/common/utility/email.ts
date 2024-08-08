import nodemailer from 'nodemailer';
import * as Handler from '../../handler/handler';
import { ErrorResponse } from '../../handler/error';
import { config } from 'dotenv';
config();
const { NODEMAILER_EMAIL, NODEMAILER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD,
    },
});

export const sendEmail = async (email: string, subject: string, html: any) => {
    try {
        const mailOptions = {
            from: NODEMAILER_EMAIL,
            to: email,
            subject: subject,
            html: html
        }
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}