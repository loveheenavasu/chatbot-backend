import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import Handler from '../handler/handler';
config();
const { NODEMAILER_EMAIL, NODEMAILER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    // secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD,
    },
});

export const sendEmail = async (data: any) => {
    try {
        let { email, otp } = data;

        const mailOptions = {
            from: NODEMAILER_EMAIL,
            to: email,
            subject: "Otp Verification",
            text: `${otp} is your verification code.`
        }

        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) { console.log("error---", error) }
            if (info) { console.log("email sent", info?.response) }
        })
    }
    catch (err) {
        await Handler.handleCustomError(err);
    }
}