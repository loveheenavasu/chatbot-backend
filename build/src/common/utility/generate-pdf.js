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
exports.generatePdf = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const handlebars_1 = __importDefault(require("handlebars"));
const handler_1 = require("../../handler/handler");
const generatePdf = (filePath, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(__dirname, '../../email-templates/chat-history.html'); // Load the HTML template
        const templateSource = fs_1.default.readFileSync(templatePath, 'utf8');
        const template = handlebars_1.default.compile(templateSource); // Compile the template
        const html = template(data); // Render the HTML
        const browser = yield puppeteer_1.default.launch(); // Launch Puppeteer
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: 'networkidle0' }); // Set HTML content directly without saving to file
        const bufferData = yield page.pdf({
            // path: `${filePath}.pdf`,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                bottom: '15mm',
                left: '15mm',
                right: '15mm'
            }
        }); // Generate PDF
        yield browser.close();
        return bufferData;
    }
    catch (err) {
        return (0, handler_1.handleCustomError)(err);
    }
});
exports.generatePdf = generatePdf;
