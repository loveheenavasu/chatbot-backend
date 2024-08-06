import { Request } from 'express';
import * as Models from '../../models/index';
import moment from 'moment';
import { Types } from 'mongoose';
import * as Handler from '../../handler/handler';
import { EmailAlreadyExists, EmailNotRegistered, IErrorResponse, NotFound, RegisteredWithGoogle, SomethingWentWrong, UnsupportedFileType, WrongOtp, WrongPassword } from '../../handler/error';
import * as CommonHelper from '../../common/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from 'dotenv';
import { session } from '../../config/neo4j';
config();
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import path from 'path';
import WordExtractor from 'word-extractor';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { type } from '../../models/text.model';
import { signType } from '../../models/user.model';
import * as ChatHistoryAggregation from './aggregation/chat-history.aggregation';
import * as EmailService from '../../common/emailService';
import { INeoConfig, IToken, ISignupPayload, CustomRequest } from '../../interfaces/common.interface';
import IUser from '../../interfaces/user.interface';
import ISession from '../../interfaces/session.interface';
import IText from '../../interfaces/text.interface';
import IChatbot from '../../interfaces/chatbot.interface';
import IIps from '../../interfaces/ips.interface';
import IMessage from '../../interfaces/message.interface';
const { v4: uuidv4 } = require('uuid');

const OPEN_API_KEY = process.env.OPEN_API_KEY as string;
const NEO_URL = process.env.NEO_URL as string;
const NEO_USERNAME = process.env.NEO_USERNAME as string;
const NEO_PASSWORD = process.env.NEO_PASSWORD as string;
const SCOPE = process.env.SCOPE as string;

const openai = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY
});


let neoConfig: INeoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};


const signup = async (req: Request) => {
    try {
        let { email } = req.body;
        let query = { email: email.toLowerCase() }
        let projection = { __v: 0 }
        let options = { lean: true }
        let fetchData: IUser | null = await Models.userModel.findOne(query, projection, options);
        if (fetchData) {
            let { _id, isEmailVerified } = fetchData
            if (isEmailVerified) return Handler.handleCustomError(EmailAlreadyExists);
            let query1 = { userId: _id }
            await Models.sessionModel.deleteMany(query1);
            let data = await signupData(req.body);
            let options = { new: true }
            let updateData = await Models.userModel.findOneAndUpdate(query, data, options);
            let accessToken = await fetchToken(updateData?._id!, SCOPE);
            updateData!._doc["accessToken"] = accessToken
            delete updateData!._doc["password"];
            delete updateData!._doc["otp"];
            await EmailService.verificationCode(email, data.otp);

            let response = {
                message: `Otp sent to ${updateData!?.email}`,
                data: updateData
            }
            return response;
        }
        else {
            let data = await signupData(req.body);
            let saveData: IUser = await Models.userModel.create(data);
            console.log("saveData---", saveData)
            let accessToken = await fetchToken(saveData?._id!, SCOPE);
            saveData!._doc["accessToken"] = accessToken
            delete saveData!._doc["password"];
            delete saveData!._doc["otp"];
            await EmailService.verificationCode(email, data.otp);
            let response = {
                message: `Otp sent to ${saveData?.email}`,
                data: saveData
            }
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const signupData = async (payload: ISignupPayload) => {
    try {
        let bcryptPass: string = await CommonHelper.hashPassword(payload?.password);
        let otp: string = await CommonHelper.generateOtp();
        let data = {
            email: payload?.email.toLowerCase(),
            password: bcryptPass,
            otp: otp,
            firstname: payload?.firstname!,
            lastname: payload?.lastname!,
            createdAt: moment().utc().valueOf()
        }
        return data;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const fetchToken = async (userId: Types.ObjectId, scope: string) => {
    try {
        let tokenData: IToken = {
            _id: userId,
            scope: scope
        }
        let accessToken: string = await CommonHelper.signToken(tokenData);
        return accessToken;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const verifyEmail = async (req: CustomRequest) => {
    try {
        let { otp: inputOtp } = req.body;
        let { _id } = req.userData!;
        let query = { _id: _id }
        let projection = { otp: 1, email: 1 }
        let option = { lean: true }
        let fetchData: IUser | null = await Models.userModel.findOne(query, projection, option);
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
                let fetchUnverified: IUser[] = await Models.userModel.find(query1, projection, option);
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
                return Handler.handleCustomError(WrongOtp);
            }
        }
        else {
            return Handler.handleCustomError(NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const resendOtp = async (req: Request) => {
    try {
        let { email } = req.body;
        let query = { email: email?.toLowerCase() }
        let fetchData = await CommonHelper.fetchUser(query);
        if (fetchData) {
            let { email } = fetchData;
            let otp: string = await CommonHelper.generateOtp();
            let update = {
                otp: otp
            }
            let option = { new: true }
            await Models.userModel.findOneAndUpdate(query, update, option);
            await EmailService.verificationCode(email!, otp)

            let response = {
                message: `Otp sent to ${email}`
            }
            return response;
        }
        else {
            return Handler.handleCustomError(EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const forgotPassword = async (req: Request) => {
    try {
        let { email } = req.body;
        let query = { email: email.toLowerCase() }
        let fetchData = await CommonHelper.fetchUser(query);
        if (fetchData) {
            let { _id, email } = fetchData;
            let otp: string = await CommonHelper.generateOtp();
            let query = { _id: _id }
            let update = { otp: otp }
            let option = { new: true }
            await Models.userModel.findOneAndUpdate(query, update, option);
            await EmailService.verificationCode(email!, otp)
            let response = {
                message: `Otp sent to ${email}`
            }
            return response;
        }
        else {
            return Handler.handleCustomError(EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const verifyOtp = async (req: Request) => {
    try {
        let { otp: inputOtp, email } = req.body;
        let query = { email: email?.toLowerCase() }
        let projection = { otp: 1 }
        let option = { lean: true }
        let fetchData: IUser | null = await Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            let { otp } = fetchData;
            if (inputOtp === otp) {
                let uniqueCode: string = await CommonHelper.generateUniqueCode();
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
                return Handler.handleCustomError(WrongOtp);
            }
        }
        else {
            return Handler.handleCustomError(NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const resetPassword = async (req: Request) => {
    try {
        let { uniqueCode, password } = req.body;
        let query = { uniqueCode: uniqueCode }
        let fetchData = await CommonHelper.fetchUser(query);
        if (fetchData) {
            let hashPass = await CommonHelper.hashPassword(password);
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
            return Handler.handleCustomError(NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const login = async (req: Request) => {
    try {
        let { email, password } = req.body;
        let query = { email: email.toLowerCase(), isEmailVerified: true }
        let projection = { __v: 0 }
        let option = { lean: true }
        let fetchData: IUser | null = await Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            let { _id, password: oldPassword, type } = fetchData;
            if (oldPassword == null && type != null) {
                return Handler.handleCustomError(RegisteredWithGoogle);
            }
            if (oldPassword == null) {
                return Handler.handleCustomError(SomethingWentWrong);
            }
            let decryptPass = await CommonHelper.comparePassword(oldPassword, password);
            if (!decryptPass) {
                return Handler.handleCustomError(WrongPassword);
            }
            else {
                let data: IToken = {
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
            return Handler.handleCustomError(EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const socialLogin = async (req: Request) => {
    try {
        let { email, name, image, socialToken, isAdmin, firstname, lastname } = req.body;
        let query = { email: email.toLowerCase() }
        let fetchData: IUser | null = await CommonHelper.fetchUser(query);
        if (fetchData) {
            let session = await createSession(fetchData?._id!, socialToken)
            fetchData.accessToken = session?.accessToken;
            return fetchData;
        }
        let dataToSave: IUser = {
            email: email.toLowerCase(),
            name: name,
            firstname: firstname,
            lastname: lastname,
            image: image,
            isAdmin: isAdmin,
            isEmailVerified: true,
            type: signType?.GOOGLE,
            createdAt: moment().utc().valueOf()
        }
        let userData: IUser = await Models.userModel.create(dataToSave);
        let session = await createSession(userData?._id!, socialToken)
        userData._doc['accessToken'] = session?.accessToken;
        return userData;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const createSession = async (user_id: Types.ObjectId, accessToken: string) => {
    try {
        let dataToSession: ISession = {
            userId: user_id,
            accessToken: accessToken,
            createdAt: moment().utc().valueOf()
        }
        let response: ISession = await Models.sessionModel.create(dataToSession);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const saveTexts = async (req: CustomRequest) => {
    try {
        const { text, documentId } = req.body;
        let { _id } = req.userData!;
        let num = 1;
        let docId = uuidv4();
        let query = { userId: new Types.ObjectId(_id), documentId: documentId }
        let projection = { __v: 0 }
        let option = { lean: true, sort: { _id: -1 } }
        let data: IText;
        let fetchChatbot: IChatbot | null = await Models.chatbotModel.findOne(query, projection, option);
        if (!fetchChatbot) {
            data = await embedText(text, type?.TEXT, _id!, undefined, num, docId);
            await createChatbot(data)
        }
        else {
            let fetchData: IText | null = await Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { docNo, documentId } = fetchData;
                docNo = docNo! + 1;
                num = docNo;
                docId = documentId
            }
            data = await embedText(text, type?.TEXT, _id!, undefined, num, docId);
        }
        let response = {
            messgage: "Text Added Successfully",
            data: data
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const createChatbot = async (data: IText) => {
    try {
        let { _id, userId, documentId } = data;
        let dataToSave: IChatbot = {
            textId: _id,
            userId: userId,
            documentId: documentId,
            createdAt: moment().utc().valueOf()
        }
        let response: IChatbot = await Models.chatbotModel.create(dataToSave);
        return response;

    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const embedText = async (text: string, type: string, userId: Types.ObjectId, fileName?: string | undefined, docNo?: number, docId?: string) => {
    try {
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });

        const docOutput = await textSplitter.splitDocuments([
            new Document({ pageContent: text, metadata: { documentId: docId?.toString(), docNo: docNo } })
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

        let dataToSave: IText = {
            text: text,
            userId: userId,
            type: type,
            fileName: fileName,
            documentId: docId,
            docNo: docNo,
            createdAt: moment().utc().valueOf()
        }
        let saveData: IText = await Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const updateTexts = async (req: CustomRequest) => {
    try {
        const { _id, text } = req.body;
        let query = { _id: new Types.ObjectId(_id) }
        let projection = { __v: 0 }
        let options = { lean: true }
        let fetchData: IText | null = await Models.textModel.findOne(query, projection, options)
        if (fetchData) {
            let { documentId, docNo } = fetchData;
            await session.run(
                `
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `,
                { documentId: documentId, docNo: docNo }
            );
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
            const docOutput = await textSplitter.splitDocuments([
                new Document({ pageContent: text, metadata: { documentId: documentId?.toString(), docNo: docNo } }),
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
            let update: IText = {
                text: text,
                docNo: docNo,
                updatedAt: moment().utc().valueOf()
            }
            await Models.textModel.updateOne(query, update);
            let response = {
                message: "Text updated successfully"
            }
            return response;
        }
        else {
            return Handler.handleCustomError(NotFound)
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const fileLists = async (req: CustomRequest) => {
    try {
        let { _id: userId } = req.userData!;
        let query = {
            userId: new Types.ObjectId(userId),
            type: type?.FILE,
            documentId: req?.query?.documentId
        }
        let projection = { __v: 0 }
        let option = await CommonHelper.setOptions(+req?.query?.pagination!, +req?.query?.limit!);
        let fetchdata: IText[] = await Models.textModel.find(query, projection, option);
        let count: number = await Models.textModel.countDocuments(query);
        let response = {
            count: count,
            data: fetchdata
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const textDetail = async (req: CustomRequest) => {
    try {
        let { _id } = req.userData!;
        let { documentId } = req.query;
        let query = {
            userId: new Types.ObjectId(_id),
            type: type?.TEXT,
            documentId: documentId
        }
        let projection = { __v: 0 }
        let options = { lean: true, sort: { _id: -1 } }
        let data: IText | null = await Models.textModel.findOne(query, projection, options);
        let response = data ?? {};
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const deleteFile = async (req: CustomRequest) => {
    try {
        let { docNo, documentId } = req.query;
        let { _id: userId } = req.userData!;
        let query = { documentId: documentId, docNo: Number(docNo) };
        await session.run(
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
        let fetchData: IText | null = await Models.textModel.findOne(query1, projection, options);
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
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const logout = async (req: CustomRequest) => {
    try {
        let { accessToken } = req.userData!;
        console.log("accessToken---", accessToken)
        let query = { accessToken: accessToken }
        await Models.sessionModel.deleteOne(query);
        let response = {
            message: "Logout Successfully"
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const updateFileText = async (text: string, type: string, documentId: string, userId: Types.ObjectId, fileName: string, docNo: number) => {
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
        let dataToSave: IText = {
            text: text,
            userId: userId,
            type: type,
            fileName: fileName,
            documentId: documentId,
            docNo: docNo,
            createdAt: moment().utc().valueOf()
        }
        let saveData: IText = await Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const textExtract = async (req: CustomRequest) => {
    try {
        let { documentId } = req.body
        let { _id: userId } = req.userData!;
        let textData = await extract(req?.file?.originalname!, req?.file?.buffer)
        let docId = uuidv4();
        let query = { userId: new Types.ObjectId(userId), documentId: documentId }
        let projection = { __v: 0 }
        let option = { lean: true, sort: { _id: -1 } }
        let data;
        let fetchChatbot: IChatbot | null = await Models.chatbotModel.findOne(query, projection, option);
        if (!fetchChatbot) {
            data = await embedText(textData, type?.FILE, userId!, req?.file?.originalname!, 1, docId);
            await createChatbot(data);
        }
        else {
            let fetchData: IText | null = await Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                docNo = docNo! + 1;
                data = await updateFileText(textData, type?.FILE, documentId!, userId!, req?.file?.originalname!, docNo)
            }
        }
        let response = {
            message: "File Added Successfully",
            data: data
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const extract = async (originalname: string, buffer: any) => {
    try {
        const extension = path.extname(originalname).toLowerCase();
        let text: string;
        const blob = new Blob([buffer]);
        switch (extension) {
            case ".pdf":
                text = await pdfLoad(blob);
                break;
            case ".txt":
                text = await textLoad(buffer);
                break;
            case ".csv":
                text = await csvLoad(blob);
                break;
            case ".docx":
                text = await docxLoad(blob);
                break;
            case ".doc":
                text = await docLoad(buffer);
                break;
            default: return Handler.handleCustomError(UnsupportedFileType);
        }
        let textData = text?.trim();
        return textData;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const pdfLoad = async (blob: any) => {
    try {
        const loader = new PDFLoader(blob);
        const docs = await loader.load();
        const text = docs?.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const textLoad = async (buffer: any) => {
    try {
        const text = buffer?.toString();
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const csvLoad = async (blob: any) => {
    try {
        const loader = new CSVLoader(blob);
        const docs = await loader.load();
        const text = docs?.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const docxLoad = async (blob: any) => {
    try {
        const loader = new DocxLoader(blob);
        const docs = await loader.load();
        const text = docs?.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const docLoad = async (buffer: any) => {
    try {
        const extractor = new WordExtractor();
        const extracted = await extractor?.extract(buffer);
        const text = extracted?.getBody();
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const chatbotLists = async (req: CustomRequest) => {
    try {
        let { _id: userId } = req.userData!;
        let query = { userId: userId }
        let projection = { __v: 0 }
        let options = { lean: true, sort: { _id: -1 } }
        let populate = [
            {
                path: "textId",
                select: "text type fileName documentId"
            }
        ]

        let data: IChatbot[] = await Models.chatbotModel.find(query, projection, options).populate(populate);
        let count: number = await Models.chatbotModel.countDocuments(query);
        let response = {
            count: count,
            data: data
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const deleteChatbot = async (req: CustomRequest) => {
    try {
        let { documentId } = req.query;
        let { _id: userId } = req.userData!;
        await session.run(
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
        let query1 = { documentId: documentId }
        await deleteSessions(query1);
        let response = {
            message: "Chatbot Deleted Successfully"
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const deleteSessions = async (query: object) => {
    try {
        let projection = { __v: 0 }
        let option = { lean: true }
        let fetchIps: IIps[] = await Models.ipAddressModel.find(query, projection, option)
        if (fetchIps?.length) {
            let ids = fetchIps.map((item) => item?._id);
            let query1 = { ipAddressId: { $in: ids } }
            await Models.chatSessionModel.deleteMany(query1);
        }
        await Models.ipAddressModel.deleteMany(query)
        await Models.messageModel.deleteMany(query);
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const chatHistory = async (req: CustomRequest) => {
    try {
        let { documentId, pagination, limit } = req.query;
        let setPagination = pagination ?? 1;
        let setLimit = limit ?? 10
        let query: any = [
            await ChatHistoryAggregation.matchData(documentId?.toString()!),
            await ChatHistoryAggregation.lookupChatSessions(),
            await ChatHistoryAggregation.unwindChatSessions(),
            await ChatHistoryAggregation.lookupMessages(),
            await ChatHistoryAggregation.groupData(),
            await ChatHistoryAggregation.facetData(+setPagination, +setLimit)
        ];
        let fetchData = await Models.ipAddressModel.aggregate(query);
        let response = {
            count: fetchData[0]?.count[0]?.count ?? 0,
            data: fetchData[0]?.data ?? []
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

const chatDetail = async (req: CustomRequest) => {
    try {
        let { sessionId, pagination, limit } = req.query;
        let query = { sessionId: new Types.ObjectId(sessionId as string) }
        let projection = { __v: 0 }
        let options = await CommonHelper.setOptions(+pagination!, +limit!, { _id: 1 });
        let fetchData: IMessage[] = await Models.messageModel.find(query, projection, options);
        let count: number = await Models.messageModel.countDocuments(query);
        let response = {
            count: count,
            data: fetchData
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}

export {
    signup,
    verifyEmail,
    resendOtp,
    forgotPassword,
    verifyOtp,
    resetPassword,
    login,
    socialLogin,
    createSession,
    saveTexts,
    updateTexts,
    fileLists,
    textDetail,
    deleteFile,
    logout,
    textExtract,
    chatbotLists,
    deleteChatbot,
    deleteSessions,
    chatHistory,
    chatDetail
}



