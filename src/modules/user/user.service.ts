import express from 'express';
import * as Models from '../../models/index';
import moment from 'moment';
import { Types } from 'mongoose';
import Handler from '../../handler/handler';
import { EmailAlreadyExists, EmailNotRegistered, NotFound, SomethingWentWrong, UnsupportedFileType, WrongOtp, WrongPassword } from '../../handler/error';
import CommonHelper from '../../common/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from 'dotenv';
import { session } from '../../config/neo4j';
config();
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
const { OPEN_API_KEY, NEO_URL, NEO_USERNAME, NEO_PASSWORD, SCOPE } = process.env;
import { Document } from "@langchain/core/documents";
const { v4: uuidv4 } = require('uuid');
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import path from 'path';
import WordExtractor from 'word-extractor';
import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import cheerio from 'cheerio';
// import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";


const openai = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY
});
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { type } from '../../models/text.model';
import { signType } from '../../models/user.model';
import { sendEmail } from '../../common/email';

let neoConfig: any = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};

export default class Service {

    static signup = async (req: any) => {
        try {
            let { email, password } = req.body;
            let query = { email: email.toLowerCase(), isEmailVerified: true }
            let projection = { __v: 0 }
            let options = { lean: true }
            let fetchData = await Models.userModel.findOne(query, projection, options);
            if (fetchData) {
                await Handler.handleCustomError(EmailAlreadyExists);
            }
            else {
                let bcryptPass = await CommonHelper.hashPass(password);
                let otp = await CommonHelper.generateOtp();
                let dataToSave = {
                    email: email.toLowerCase(),
                    password: bcryptPass,
                    otp: otp,
                    createdAt: moment().utc().valueOf()
                }
                let saveData: any = await Models.userModel.create(dataToSave);
                delete saveData._doc["password"];
                delete saveData._doc["otp"];
                console.log("save  data befor----", saveData)
                let data = {
                    _id: saveData?._id,
                    scope: SCOPE
                }
                let accessToken = await CommonHelper.signToken(data);
                saveData._doc["accessToken"] = accessToken
                let emailData = {
                    email: email,
                    otp: otp
                }
                await sendEmail(emailData);
                console.log("--", saveData)
                let response = {
                    message: `Otp sent to ${email}`,
                    data: saveData
                }
                return response;
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static verifyEmail = async (req: any) => {
        try {
            let { otp: inputOtp } = req.body;
            let { _id } = req.userData;
            let query = { _id: _id }
            let projection = { otp: 1, email: 1 }
            let option = { lean: true }
            let fetchData = await Models.userModel.findOne(query, projection, option);
            console.log("fetchData---", fetchData)
            if (fetchData) {
                let { otp, email } = fetchData;
                if (inputOtp === otp) {
                    let update = {
                        isEmailVerified: true,
                        otp: null
                    }
                    let options = { new: true }
                    await Models.userModel.findOneAndUpdate(query, update, options);
                    let query1 = { email: email, isEmailVerified: false }
                    let projection = { _id: 1 }
                    let fetchUnverified = await Models.userModel.find(query1, projection, option);
                    if (fetchUnverified?.length) {
                        await Models.userModel.deleteMany(query1);
                        for (let i = 0; i < fetchUnverified?.length; i++) {
                            let { _id } = fetchUnverified[i]
                            let query = { userId: _id }
                            await Models.sessionModel.deleteOne(query);
                        }
                    }
                    let response = {
                        message: "Otp verified successfully"
                    }
                    return response;
                }
                else {
                    await Handler.handleCustomError(WrongOtp);
                }
            }
            else {
                await Handler.handleCustomError(NotFound);
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static resendOtp = async (req: any) => {
        try {
            let { email } = req.body;
            let query = { email: email?.toLowerCase() }
            let fetchData = await CommonHelper.fetchUser(query);
            if (fetchData) {
                let { email } = fetchData;
                let otp = await CommonHelper.generateOtp();
                let update = {
                    otp: otp
                }
                let option = { new: true }
                await Models.userModel.findOneAndUpdate(query, update, option);
                let emailData = {
                    email: email,
                    otp: otp
                }
                await sendEmail(emailData);
                let response = {
                    message: `Otp sent to ${email}`
                }
                return response;
            }
            else {
                await Handler.handleCustomError(EmailNotRegistered);
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static forgotPassword = async (req: any) => {
        try {
            let { email } = req.body;
            let query = { email: email.toLowerCase() }
            let fetchData = await CommonHelper.fetchUser(query);
            if (fetchData) {
                let { _id, email } = fetchData;
                let otp = await CommonHelper.generateOtp();
                let query = { _id: _id }
                let update = { otp: otp }
                let option = { new: true }
                await Models.userModel.findOneAndUpdate(query, update, option);
                let emailData = {
                    email: email,
                    otp: otp
                }
                await sendEmail(emailData);
                let response = {
                    message: `Otp sent to ${email}`
                }
                return response;
            }
            else {
                await Handler.handleCustomError(EmailNotRegistered);
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static verifyOtp = async (req: any) => {
        try {
            let { otp: inputOtp, email } = req.body;
            let query = { email: email?.toLowerCase() }
            let projection = { otp: 1 }
            let option = { lean: true }
            let fetchData = await Models.userModel.findOne(query, projection, option);
            if (fetchData) {
                let { otp } = fetchData;
                if (inputOtp === otp) {
                    let uniqueCode = await CommonHelper.generateUniqueCode();
                    let update = {
                        uniqueCode: uniqueCode,
                        otp: null
                    }
                    let options = { new: true }
                    await Models.userModel.findOneAndUpdate(query, update, options)
                    let response = {
                        message: "Otp verified successfully",
                        uniqueCode: uniqueCode
                    }
                    return response;
                }
                else {
                    await Handler.handleCustomError(WrongOtp);
                }
            }
            else {
                await Handler.handleCustomError(NotFound);
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static resetPassword = async (req: any) => {
        try {
            let { uniqueCode, password } = req.body;
            let query = { uniqueCode: uniqueCode }
            let fetchData = await CommonHelper.fetchUser(query);
            if (fetchData) {
                let hashPass = await CommonHelper.hashPass(password);
                let update = {
                    uniqueCode: null,
                    password: hashPass
                }
                let options = { new: true }
                await Models.userModel.findOneAndUpdate(query, update, options)
                let response = {
                    message: "Password Changed Successfully"
                }
                return response;
            }
            else {
                await Handler.handleCustomError(NotFound);
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static login = async (req: any) => {
        try {
            let { email, password } = req.body;
            let query = { email: email.toLowerCase() }
            let projection = { __v: 0 }
            let option = { lean: true }
            let fetchData = await Models.userModel.findOne(query, projection, option);
            if (fetchData) {
                let { _id, password: oldPassword, type } = fetchData;
                if (oldPassword == null) {
                    await Handler.handleCustomError(SomethingWentWrong);
                }
                let decryptPass = await CommonHelper.comparePass(oldPassword, password);
                if (!decryptPass) {
                    await Handler.handleCustomError(WrongPassword);
                }
                else {
                    let data = {
                        _id: _id,
                        scope: SCOPE
                    }
                    let accessToken = await CommonHelper.signToken(data);
                    let resData = {
                        _id: fetchData?._id,
                        email: fetchData?.email,
                        accessToken: accessToken
                    }
                    let response = {
                        message: "Login successfully",
                        data: resData
                    }
                    return response;
                }
            }
            else {
                await Handler.handleCustomError(EmailNotRegistered);
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    // static profile = async (req: any) => {
    //     try {
    //         let { _id } = req.userData;
    //         let query = { _id: _id }
    //         let projection = { __v: 0, password: 0, otp: 0, uniqueCode: 0 }
    //         let option = { lean: true }
    //         let fetchData = await Models.userModel.findOne(query, projection, option);
    //         return fetchData ?? {};
    //     }
    //     catch (err) {
    //         await Handler.handleCustomError(err);
    //     }
    // }

    static socialLogin = async (req: express.Request | any) => {
        try {
            let { email, name, image, socialToken, isAdmin } = req.body;
            let query = { email: email.toLowerCase() }
            let fetchData: any = await CommonHelper.fetchUser(query);
            if (fetchData) {
                let { _id } = fetchData
                let session = await this.createSession(_id, socialToken)
                fetchData.accessToken = session?.accessToken;
                return fetchData;
            }
            let dataToSave = {
                email: email.toLowerCase(),
                name: name,
                image: image,
                isAdmin: isAdmin,
                isEmailVerified: true,
                type: signType?.GOOGLE,
                createdAt: moment().utc().valueOf()
            }
            let userData: any = await Models.userModel.create(dataToSave);
            let session = await this.createSession(userData?._id, socialToken)
            userData._doc['accessToken'] = session?.accessToken;
            return userData;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static createSession = async (user_id: Types.ObjectId, accessToken: string) => {
        try {
            let dataToSession = {
                userId: user_id,
                accessToken: accessToken,
                createdAt: moment().utc().valueOf()
            }
            let response = await Models.sessionModel.create(dataToSession);
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static saveTexts = async (req: any) => {
        try {
            const { text, documentId } = req.body;
            let { _id } = req.userData;
            let num = 1;
            let docId = uuidv4();
            let query = { userId: new Types.ObjectId(_id), documentId: documentId }
            let projection = { __v: 0 }
            let option = { lean: true, sort: { _id: -1 } }
            let data: any;
            let fetchChatbot = await Models.chatbotModel.findOne(query, projection, option);
            if (!fetchChatbot) {
                data = await this.embedText(text, type?.TEXT, _id, null, num, docId);
                await this.createChatbot(data)
            }
            else {
                let fetchData = await Models.textModel.findOne(query, projection, option);
                if (fetchData) {
                    let { docNo, documentId } = fetchData;
                    docNo = docNo + 1;
                    num = docNo;
                    docId = documentId
                }
                data = await this.embedText(text, type?.TEXT, _id, null, num, docId);
            }
            let response = {
                messgage: "Text Added Successfully",
                data: data
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static createChatbot = async (data: any) => {
        try {
            let { _id, userId, documentId } = data;
            let dataToSave = {
                textId: _id,
                userId: userId,
                documentId: documentId,
                createdAt: moment().utc().valueOf()
            }
            let response = await Models.chatbotModel.create(dataToSave);
            return response;

        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static embedText = async (text: any, type: string, userId: any, fileName?: any, docNo?: any, docId?: any) => {
        try {
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });

            const docOutput = await textSplitter.splitDocuments([
                new Document({ pageContent: text, metadata: { documentId: docId?.toString(), docNo: docNo } }), // Ensure id is converted to string
            ]);
            docOutput.forEach(doc => {
                if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                    doc.metadata.loc = doc.metadata.loc.toString();
                }
            });
            const vectorStore = await Neo4jVectorStore.fromDocuments(
                docOutput,
                openai,
                neoConfig
            );

            let dataToSave = {
                text: text,
                userId: userId,
                type: type,
                fileName: fileName,
                documentId: docId,
                docNo: docNo,
                createdAt: moment().utc().valueOf()
            }
            let saveData = await Models.textModel.create(dataToSave);
            return saveData;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static updateTexts = async (req: any) => {
        try {
            const { _id, text } = req.body;
            let { _id: userId } = req.userData;
            let query = { _id: new Types.ObjectId(_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let fetchData = await Models.textModel.findOne(query, projection, options)
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                const result: any = await session.run(
                    `
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `,
                    { documentId: documentId, docNo: docNo }
                );
                const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
                const docOutput = await textSplitter.splitDocuments([
                    new Document({ pageContent: text, metadata: { documentId: documentId?.toString(), docNo: docNo } }), // Ensure id is converted to string
                ]);
                docOutput.forEach(doc => {
                    if (doc?.metadata?.loc && typeof doc?.metadata?.loc === 'object') {
                        doc.metadata.loc = doc?.metadata?.loc?.toString(); // Convert object to string representation
                    }
                });
                const vectorStore = await Neo4jVectorStore.fromDocuments(
                    docOutput,
                    openai,
                    neoConfig
                );
                let update = {
                    text: text,
                    docNo: docNo,
                    updatedAt: moment().utc().valueOf()
                }
                let data = await Models.textModel.updateOne(query, update);
                let response = {
                    message: "Text updated successfully"
                }
                return response;
            }
            else {
                await Handler.handleCustomError(NotFound)
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static fileLists = async (req: any) => {
        try {
            let { _id: userId } = req.userData;
            let { pagination, limit, documentId } = req.query;
            let query = {
                userId: new Types.ObjectId(userId),
                type: type?.FILE,
                documentId: documentId
            }
            let projection = { __v: 0 }
            // let option = { lean: true, sort: { _id: -1 } }
            let option = await CommonHelper.setOptions(pagination, limit);
            let fetchdata = await Models.textModel.find(query, projection, option);
            let count = await Models.textModel.countDocuments(query);
            let response = {
                count: count,
                data: fetchdata
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static textDetail = async (req: any) => {
        try {
            let { _id } = req.userData;
            let { documentId } = req?.query;
            let query = {
                userId: new Types.ObjectId(_id),
                type: type?.TEXT,
                documentId: documentId
            }
            let projection = { __v: 0 }
            let options = { lean: true, sort: { _id: -1 } }
            let data = await Models.textModel.findOne(query, projection, options);
            let response = data ?? {};
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static deleteFile = async (req: any) => {
        try {
            let { docNo, documentId } = req.query;
            let { _id: userId } = req.userData;
            let query = { documentId: documentId, docNo: Number(docNo) };
            const result: any = await session.run(
                `
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `,
                { documentId: documentId?.toString(), docNo: Number(docNo) }
            );
            await Models.textModel.deleteOne(query);
            let query1 = { documentId: documentId }
            let projection = { __v: 0 }
            let options = { lean: true, sort: { _id: 1 } }
            let fetchData = await Models.textModel.findOne(query1, projection, options);
            if (fetchData) {
                let { _id: textId } = fetchData
                let query = {
                    documentId: documentId,
                    userId: userId
                }
                let update = { textId: textId }
                let options = { new: true }
                await Models.chatbotModel.findOneAndUpdate(query, update, options)
            }
            else {
                await Models.chatbotModel.deleteOne(query1);
            }

            let response = {
                message: "Deleted Successfully"
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static logout = async (req: any) => {
        try {
            let { accessToken } = req.userData
            let query = { accessToken: accessToken }
            await Models.sessionModel.deleteOne(query);
            let response = {
                message: "Logout Successfully"
            }
            return response;
        }
        catch (err) {
            console.log("err-------", err)
            await Handler.handleCustomError(err);
        }
    }

    static updateFileText = async (text: any, type: string, documentId: any, userId: any, fileName: string, docNo: any) => {
        try {
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
            const docOutput = await textSplitter.splitDocuments([
                new Document({ pageContent: text, metadata: { documentId: documentId?.toString(), docNo: docNo } }),
            ]);
            docOutput.forEach(doc => {
                if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                    doc.metadata.loc = doc.metadata.loc.toString();
                }
            });
            const vectorStore = await Neo4jVectorStore.fromDocuments(
                docOutput,
                openai,
                neoConfig
            );
            let dataToSave = {
                text: text,
                userId: userId,
                type: type,
                fileName: fileName,
                documentId: documentId,
                docNo: docNo,
                createdAt: moment().utc().valueOf()
            }
            let saveData = await Models.textModel.create(dataToSave);
            return saveData;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static textExtract = async (req: any) => {
        try {
            let { documentId } = req.body
            let { originalname, buffer } = req?.file;
            let { _id: userId } = req.userData;
            let textData = await this.extract(originalname, buffer)
            let docId = uuidv4();
            let query = { userId: new Types.ObjectId(userId), documentId: documentId }
            let projection = { __v: 0 }
            let option = { lean: true, sort: { _id: -1 } }
            let data: any;
            let fetchChatbot = await Models.chatbotModel.findOne(query, projection, option);
            if (!fetchChatbot) {
                data = await this.embedText(textData, type?.FILE, userId, originalname, 1, docId);
                await this.createChatbot(data);
            }
            else {
                let fetchData = await Models.textModel.findOne(query, projection, option);
                if (fetchData) {
                    let { documentId, docNo } = fetchData;
                    docNo = docNo + 1;
                    data = await this.updateFileText(textData, type?.FILE, documentId, userId, originalname, docNo)
                }
            }

            let response = {
                message: "File Added Successfully",
                data: data
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static extract = async (originalname: any, buffer: any) => {
        try {
            const extension = path.extname(originalname).toLowerCase();
            let text: any;
            const blob = new Blob([buffer]);
            switch (extension) {
                case ".pdf":
                    text = await this.pdfLoad(blob);
                    break;
                case ".txt":
                    text = await this.textLoad(buffer);
                    break;
                case ".csv":
                    text = await this.csvLoad(blob);
                    break;
                case ".docx":
                    text = await this.docxLoad(blob);
                    break;
                case ".doc":
                    text = await this.docLoad(buffer);
                    break;
                default: await Handler.handleCustomError(UnsupportedFileType);
            }
            let textData = text?.trim();
            return textData;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static pdfLoad = async (blob: any) => {
        try {
            const loader = new PDFLoader(blob);
            const docs = await loader.load();
            const text = docs?.map(doc => doc.pageContent).join(' ');
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static textLoad = async (buffer: any) => {
        try {
            const text = buffer?.toString();
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static csvLoad = async (blob: any) => {
        try {
            const loader = new CSVLoader(blob);
            const docs = await loader.load();
            const text = docs?.map(doc => doc.pageContent).join(' ');
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static docxLoad = async (blob: any) => {
        try {
            const loader = new DocxLoader(blob);
            const docs = await loader.load();
            const text = docs?.map(doc => doc.pageContent).join(' ');
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static docLoad = async (buffer: any) => {
        try {
            const extractor = new WordExtractor();
            const extracted = await extractor?.extract(buffer);
            const text = extracted?.getBody();
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static chatbotLists = async (req: any) => {
        try {
            let { _id: userId } = req.userData;
            let query = { userId: userId }
            let projection = { __v: 0 }
            let options = { lean: true, sort: { _id: -1 } }
            let populate = [
                {
                    path: "textId",
                    select: "text type fileName documentId"
                }
            ]

            let data = await Models.chatbotModel.find(query, projection, options).populate(populate);
            let count = await Models.chatbotModel.countDocuments(query);
            let response = {
                count: count,
                data: data
            }
            return response;
        }
        catch (err) {
            console.log("err---", err)
            await Handler.handleCustomError(err);
        }
    }

    static deleteChatbot = async (req: any) => {
        try {
            let { documentId } = req.query;
            let { _id: userId } = req.userData;
            const result: any = await session.run(
                `
                    MATCH (n:Chunk {documentId: $documentId})
                    DELETE n
                    `,
                { documentId: documentId }
            );
            let query = {
                userId: userId,
                documentId: documentId
            }
            await Models.textModel.deleteMany(query);
            await Models.chatbotModel.deleteOne(query);
            let response = {
                message: "Chatbot Deleted Successfully"
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    // static url = async (req: any) => {
    //     try {
    //         let url = `https://timesofindia.indiatimes.com/travel/`;

    //         const loader = new PlaywrightWebBaseLoader(url);
    //         const docs = await loader.load();

    //         const htmlContent = docs[0]?.pageContent;

    //         const $ = cheerio.load(htmlContent);
    //         let textContent: string = '';

            
    //         $('*').each((i, elem) => {
    //             textContent += $(elem).text().trim() + ' ';
    //         });

    //         textContent = textContent.replace(/\s+/g, ' ').trim();
    //         console.log("textContent----------------", textContent);

    //         // const loader = YoutubeLoader.createFromUrl("https://youtu.be/vsWxs1tuwDk?feature=shared", {
    //         //     addVideoInfo: true,
    //         // });

    //         // const docs = await loader.load();

    //         return "text";
    //     }
    //     catch (err) {
    //         await Handler.handleCustomError(err);
    //     }
    // }


}



