import path from 'path';
import { arrangeChatHistoryData } from '../../types/response';
import fs from 'fs';
import { ErrorResponse } from '../../handler/error';
import Handlebars from 'handlebars';
import { handleCustomError } from '../../handler/handler';
import pdf from 'html-pdf';

const generatePdf = async (data: arrangeChatHistoryData): Promise<Buffer> => {
    try {
        const templatePath = path.join(__dirname, '../../email-templates/chat-history.html'); // Load the HTML template
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const options = {
            format: 'A4',
            border: {
                top: "10mm",            
                right: "10mm",
                bottom: "10mm",
                left: "10mm"
            },
            footer: {
                height: '10mm'
            }
        };
        const template = Handlebars.compile(templateSource); // Compile the template
        const html = template(data);
        const bufferData = await generatePdfBuffer(html, options); // Generate PDF from HTML
        return bufferData;
    }
    catch (err) {
        return handleCustomError(err as ErrorResponse);
    }
}

const generatePdfBuffer = async (html: string, options: any): Promise<Buffer> => {
    try {
        const buffer: Buffer = await new Promise((resolve, reject) => {
            pdf.create(html, options).toBuffer((err: any, buffer: Buffer) => {
                if (err) {
                    return reject(err);
                }
                resolve(buffer);
            });
        });
        return buffer;
    } catch (err) {
        return handleCustomError(err as ErrorResponse);
    }
};

export {
    generatePdf
}