import path from 'path';
import { arrangeChatHistoryData } from '../../types/response';
import fs from 'fs';
import { ErrorResponse } from '../../handler/error';
import Handlebars from 'handlebars';
import { handleCustomError } from '../../handler/handler';
import pdf from 'html-pdf';

const generatePdf = async (filePath: string, data: arrangeChatHistoryData): Promise<Buffer> => {
    try {
        const templatePath = path.join(__dirname, '../../email-templates/chat-history.html'); // Load the HTML template
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const options = { format: 'A4', border: '10mm' };
        const template = Handlebars.compile(templateSource); // Compile the template
        const html = template(data); 
        // Generate PDF from HTML
        const bufferData = await generatePdfBuffer(html, options);
        // console.log("🚀 ~ generatePdf ~ bufferData:", bufferData)

        // Render the HTML
        // const browser = await puppeteer.launch(); // Launch Puppeteer
        // const page = await browser.newPage();
        // await page.setContent(html, { waitUntil: 'networkidle0' }); // Set HTML content directly without saving to file
        // const bufferData = await page.pdf({
        //     path: `${filePath}.pdf`,
        //     format: 'A4',
        //     printBackground: true,
        //     margin: {
        //         top: '15mm',
        //         bottom: '15mm',
        //         left: '15mm',
        //         right: '15mm'
        //     }
        // }); // Generate PDF
        // await browser.close();
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