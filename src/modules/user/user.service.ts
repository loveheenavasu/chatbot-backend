import { Request } from 'express';
import * as Models from '../../models/index';
import moment from 'moment';
import { Types } from 'mongoose';
import * as Handler from '../../handler/handler';
import { EmailAlreadyExists, EmailNotRegistered, ErrorResponse, NotFound, RegisteredWithGoogle, RegisteredWithPassword, SomethingWentWrong, UnsupportedFileType, WrongOtp, WrongPassword } from '../../handler/error';
import * as CommonHelper from '../../common/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { session } from '../../config/neo4j';
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import path from 'path';
import WordExtractor from 'word-extractor';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Type } from '../../models/text.model';
import { SignType } from '../../models/user.model';
import * as ChatHistoryAggregation from './aggregation/chat-history.aggregation';
import * as EmailService from '../../common/emailService';
import { NeoConfig, Token, SignupPayload, CustomRequest } from '../../interfaces/common.interface';
import User from '../../interfaces/user.interface';
import Session from '../../interfaces/session.interface';
import Text from '../../interfaces/text.interface';
import Chatbot from '../../interfaces/chatbot.interface';
import Ips from '../../interfaces/ips.interface';
import Message from '../../interfaces/message.interface';
import { config } from 'dotenv';
import Forms from '../../interfaces/form.interface';
import UserInfo from '../../interfaces/information.interface';
import { SessionType } from '../../models/chat-session.model';
config();

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

const neoConfig: NeoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};

const projection = { __v: 0 };
const option = { lean: true };
const options = { new: true };
const optionWithSortDesc = { lean: true, sort: { _id: -1 } };
const optionWithSortAsc = { lean: true, sort: { _id: 1 } };

interface UserResponse {
    message?: string;
    data: User
}

interface Response {
    message: string;
    data: Text
}

interface FormResponse {
    message: string;
    data?: Forms
}

interface UserInfoResponse {
    message: string;
    data: UserInfo
}

interface MessageResponse {
    message: string
}

interface VerifyResponse {
    message: string;
    uniqueCode: string
}

interface ResponseList {
    count: number;
    data: Text[];
}

interface ChatbotResponse {
    count: number;
    data: Chatbot[];
}

interface MessageResponseList {
    count: number;
    data: Message[]
}

interface List {
    _id: string;
    ipAddress: string;
    documentId: string;
    sessionType: string;
    message: Message[]
}

interface ChatHistory {
    count: number;
    data: List[]
}

interface FormChatbot {
    isFormCompleted?: boolean;
    data: Forms
}

const signup = async (req: Request): Promise<UserResponse> => {
    try {
        const { email } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail };
        const user = await Models.userModel.findOne(query, projection, option);
        if (user) {
            if (user.isEmailVerified) return Handler.handleCustomError(EmailAlreadyExists);
            await Models.sessionModel.deleteMany({ userId: user._id });
            const updatedData = await updateUser(user._id, req.body);
            await EmailService.verificationCode(updatedData?.email!, updatedData?.otp!);
            delete updatedData!._doc.otp;
            const response: UserResponse = {
                message: `Otp sent to ${updatedData!.email}`,
                data: updatedData!
            }
            return response;
        }
        else {
            const newUser = await createNewUser(req.body);
            await EmailService.verificationCode(newUser?.email!, newUser?.otp!);
            delete newUser?._doc.otp;
            const response: UserResponse = {
                message: `Otp sent to ${newUser?.email}`,
                data: newUser
            }
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const createNewUser = async (payload: SignupPayload): Promise<User> => {
    try {
        const data = await signupData(payload);
        const user = await Models.userModel.create(data);
        user._doc.accessToken = await fetchToken(user._id, SCOPE);
        delete user._doc.password;
        return user;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
};

const updateUser = async (userId: Types.ObjectId, payload: SignupPayload): Promise<User | null> => {
    try {
        const data = await signupData(payload);
        const updatedUser = await Models.userModel.findOneAndUpdate({ _id: userId }, data, options);
        updatedUser!._doc.accessToken = await fetchToken(updatedUser!._id, SCOPE);
        delete updatedUser!._doc.password;
        return updatedUser;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const signupData = async (payload: SignupPayload): Promise<User> => {
    try {
        const bcryptPass: string = await CommonHelper.hashPassword(payload?.password);
        const otp: string = CommonHelper.generateOtp();
        const data: User = {
            email: payload?.email.toLowerCase(),
            password: bcryptPass,
            otp: otp,
            firstname: payload.firstname,
            lastname: payload.lastname,
            createdAt: moment().utc().valueOf()
        }
        return data;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const fetchToken = async (userId: Types.ObjectId, scope: string): Promise<string> => {
    try {
        const tokenData: Token = { _id: userId, scope: scope };
        const accessToken = await CommonHelper.signToken(tokenData);
        return accessToken;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const verifyEmail = async (req: CustomRequest): Promise<MessageResponse> => {
    try {
        const { otp: inputOtp } = req.body;
        const { _id } = req.userData!;
        const query = { _id: _id };
        const fetchData: User | null = await Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            if (inputOtp === fetchData.otp) {
                const update = { isEmailVerified: true, otp: null }
                await Models.userModel.findOneAndUpdate(query, update, options);
                const response: MessageResponse = { message: "Otp verified successfully" }
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
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const resendOtp = async (req: Request): Promise<MessageResponse> => {
    try {
        const { email } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail };
        const fetchData = await CommonHelper.fetchUser(query);
        if (fetchData) {
            const otp = CommonHelper.generateOtp();
            const update = { otp: otp };
            await Models.userModel.findOneAndUpdate(query, update, options);
            await EmailService.verificationCode(fetchData.email!, otp);
            const response: MessageResponse = { message: `Otp sent to ${email}` };
            return response;
        }
        else {
            return Handler.handleCustomError(EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const forgotPassword = async (req: Request): Promise<MessageResponse> => {
    try {
        const { email } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail, isEmailVerified: true };
        const fetchData = await CommonHelper.fetchUser(query);
        if (fetchData) {
            const { _id, email, type } = fetchData;
            if (type != null) return Handler.handleCustomError(RegisteredWithGoogle);
            const otp = CommonHelper.generateOtp();
            const query = { _id: _id };
            const update = { otp: otp };
            await Models.userModel.findOneAndUpdate(query, update, options);
            await EmailService.verificationCode(fetchData.email!, otp);
            const response: MessageResponse = { message: `Otp sent to ${email}` };
            return response;
        }
        else {
            return Handler.handleCustomError(EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const verifyOtp = async (req: Request): Promise<VerifyResponse> => {
    try {
        const { otp: inputOtp, email } = req.body;
        const lowerCaseEmail = email.toLowerCase()
        const query = { email: lowerCaseEmail };
        const projection = { otp: 1 };
        const fetchData: User | null = await Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            if (inputOtp === fetchData.otp) {
                const uniqueCode = CommonHelper.generateUniqueCode();
                const update = { uniqueCode: uniqueCode, otp: null }
                await Models.userModel.findOneAndUpdate(query, update, options)
                const response: VerifyResponse = {
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
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const resetPassword = async (req: Request): Promise<MessageResponse> => {
    try {
        const { uniqueCode, password } = req.body;
        const query = { uniqueCode: uniqueCode };
        const fetchData = await CommonHelper.fetchUser(query);
        if (fetchData) {
            const hashPass = await CommonHelper.hashPassword(password);
            const update = { uniqueCode: null, password: hashPass };
            await Models.userModel.findOneAndUpdate(query, update, options);
            const response: MessageResponse = { message: "Password Changed Successfully" };
            return response;
        }
        else {
            return Handler.handleCustomError(NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const login = async (req: Request): Promise<UserResponse> => {
    try {
        const { email, password } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail, isEmailVerified: true };
        const fetchData = await Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            const { _id, password: oldPassword, type } = fetchData;
            if (oldPassword == null && type != null) return Handler.handleCustomError(RegisteredWithGoogle);
            if (oldPassword == null) return Handler.handleCustomError(SomethingWentWrong);
            const decryptPass = await CommonHelper.comparePassword(oldPassword, password);
            if (!decryptPass) return Handler.handleCustomError(WrongPassword);
            const data: Token = { _id: _id, scope: SCOPE };
            const accessToken = await CommonHelper.signToken(data);
            const resData: User = {
                _id: fetchData?._id,
                email: fetchData?.email,
                accessToken: accessToken
            };
            const response: UserResponse = {
                message: "Login successfully",
                data: resData
            };
            return response;
        }
        else {
            return Handler.handleCustomError(EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const profile = async (req: CustomRequest): Promise<User> => {
    try {
        delete req.userData!.accessToken;
        return req.userData! ?? {};
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const socialLogin = async (req: Request): Promise<User> => {
    try {
        const { email, name, image, socialToken, isAdmin, firstname, lastname } = req.body;
        const query = { email: email.toLowerCase(), isEmailVerified: true }
        const fetchData = await CommonHelper.fetchUser(query);
        if (fetchData) {
            if (!fetchData.type) return Handler.handleCustomError(RegisteredWithPassword);
            const session = await createSession(fetchData._id!, socialToken)
            fetchData.accessToken = session.accessToken;
            return fetchData;
        };
        const dataToSave: User = {
            email: email.toLowerCase(),
            name,
            firstname,
            lastname,
            image,
            isAdmin,
            isEmailVerified: true,
            type: SignType.GOOGLE,
            createdAt: moment().utc().valueOf()
        }
        const saveData = await Models.userModel.create(dataToSave);
        const session = await createSession(saveData._id, socialToken)
        saveData._doc['accessToken'] = session.accessToken;
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const createSession = async (user_id: Types.ObjectId, accessToken: string): Promise<Session> => {
    try {
        const dataToSession: Session = {
            userId: user_id,
            accessToken: accessToken,
            createdAt: moment().utc().valueOf()
        }
        const response: Session = await Models.sessionModel.create(dataToSession);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const saveTexts = async (req: CustomRequest): Promise<Response> => {
    try {
        const { text, documentId } = req.body;
        const { _id } = req.userData!;
        let num = 1, docId = uuidv4(), data: Text;
        const query = { userId: new Types.ObjectId(_id), documentId: documentId }
        const fetchChatbot: Chatbot | null = await Models.chatbotModel.findOne(query, projection, optionWithSortDesc);
        if (!fetchChatbot) {
            data = await embedText(text, Type.TEXT, _id!, undefined, num, docId);
            await createChatbot(data)
        }
        else {
            const fetchData: Text | null = await Models.textModel.findOne(query, projection, optionWithSortDesc);
            if (fetchData) {
                let { docNo, documentId } = fetchData;
                docNo = docNo! + 1;
                num = docNo;
                docId = documentId
            }
            data = await embedText(text, Type.TEXT, _id!, undefined, num, docId);
        }
        const response: Response = {
            message: "Text Added Successfully",
            data: data
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const createChatbot = async (data: Text): Promise<Chatbot> => {
    try {
        const { _id, userId, documentId } = data;
        const dataToSave: Chatbot = {
            textId: _id,
            userId: userId,
            documentId: documentId,
            createdAt: moment().utc().valueOf()
        }
        const response: Chatbot = await Models.chatbotModel.create(dataToSave);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const embedText = async (text: string, type: string, userId: Types.ObjectId, fileName?: string | undefined, docNo?: number, docId?: string): Promise<Text> => {
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
        await Neo4jVectorStore.fromDocuments(
            docOutput,
            openai,
            neoConfig
        );
        const dataToSave: Text = {
            text,
            userId,
            type,
            fileName,
            docNo,
            documentId: docId,
            createdAt: moment().utc().valueOf()
        }
        const saveData = await Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const updateTexts = async (req: CustomRequest): Promise<MessageResponse> => {
    try {
        const { _id, text } = req.body;
        const query = { _id: new Types.ObjectId(_id) }
        const fetchData: Text | null = await Models.textModel.findOne(query, projection, option)
        if (fetchData) {
            const { documentId, docNo } = fetchData;
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
            await Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
            const update: Text = {
                text: text,
                docNo: docNo,
                updatedAt: moment().utc().valueOf()
            }
            await Models.textModel.updateOne(query, update);
            const response: MessageResponse = { message: "Text updated successfully" }
            return response;
        }
        else {
            return Handler.handleCustomError(NotFound)
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const fileLists = async (req: CustomRequest): Promise<ResponseList> => {
    try {
        const { documentId, pagination, limit } = req.query;
        const { _id: userId } = req.userData!;
        const query = {
            userId: new Types.ObjectId(userId),
            type: Type.FILE,
            documentId: documentId
        }
        const option = CommonHelper.setOptions(+pagination!, +limit!);
        const fetchdata: Text[] = await Models.textModel.find(query, projection, option);
        const count = await Models.textModel.countDocuments(query);
        const response: ResponseList = {
            count: count,
            data: fetchdata
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const textDetail = async (req: CustomRequest): Promise<Text> => {
    try {
        const { _id } = req.userData!;
        const { documentId } = req.query;
        const query = {
            userId: new Types.ObjectId(_id),
            type: Type.TEXT,
            documentId: documentId
        }
        const response: Text | null = await Models.textModel.findOne(query, projection, optionWithSortDesc);
        return response ?? {};
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const deleteFile = async (req: CustomRequest): Promise<MessageResponse> => {
    try {
        const { docNo, documentId } = req.query;
        const { _id: userId } = req.userData!;
        const query = { documentId: documentId, docNo: Number(docNo) };
        await session.run(
            `
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `,
            { documentId: documentId?.toString(), docNo: Number(docNo) }
        );
        await Models.textModel.deleteOne(query);
        const query1 = { documentId: documentId }
        const fetchData: Text | null = await Models.textModel.findOne(query1, projection, optionWithSortAsc);
        if (fetchData) {
            const { _id: textId } = fetchData;
            const query = { documentId: documentId, userId: userId };
            const update = { textId: textId };
            await Models.chatbotModel.findOneAndUpdate(query, update, options);
        }
        else {
            await Models.chatbotModel.deleteOne(query1);
        }
        const response: MessageResponse = { message: "Deleted Successfully" }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const logout = async (req: CustomRequest): Promise<MessageResponse> => {
    try {
        await Models.sessionModel.deleteOne({ accessToken: req.userData!.accessToken });
        const response: MessageResponse = { message: "Logout Successfully" }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const updateFileText = async (text: string, type: string, documentId: string, userId: Types.ObjectId, fileName: string, docNo: number): Promise<Text> => {
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
        await Neo4jVectorStore.fromDocuments(
            docOutput,
            openai,
            neoConfig
        );
        const dataToSave: Text = {
            text,
            userId,
            type,
            fileName,
            documentId,
            docNo,
            createdAt: moment().utc().valueOf()
        }
        const saveData = await Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const textExtract = async (req: CustomRequest): Promise<Response> => {
    try {
        const { documentId } = req.body
        const { _id: userId } = req.userData!;
        const textData = await extract(req.file!.originalname, req.file!.buffer)
        let docId = uuidv4();
        const query = { userId: new Types.ObjectId(userId), documentId: documentId }
        const fetchChatbot: Chatbot | null = await Models.chatbotModel.findOne(query, projection, optionWithSortDesc);
        let data;
        if (!fetchChatbot) {
            data = await embedText(textData, Type.FILE, userId!, req?.file?.originalname!, 1, docId);
            await createChatbot(data);
        }
        else {
            const fetchData: Text | null = await Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                docNo = docNo! + 1;
                data = await updateFileText(textData, Type.FILE, documentId!, userId!, req?.file?.originalname!, docNo)
            }
        }
        const response: Response = {
            message: "File Added Successfully",
            data: data!
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const extract = async (originalname: string, buffer: any): Promise<string> => {
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
        const textData = text.trim();
        return textData;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const pdfLoad = async (blob: any): Promise<string> => {
    try {
        const loader = new PDFLoader(blob);
        const docs = await loader.load();
        const text = docs?.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const textLoad = (buffer: any): Promise<string> => {
    try {
        const text = buffer.toString();
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const csvLoad = async (blob: any): Promise<string> => {
    try {
        const loader = new CSVLoader(blob);
        const docs = await loader.load();
        const text = docs?.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const docxLoad = async (blob: any): Promise<string> => {
    try {
        const loader = new DocxLoader(blob);
        const docs = await loader.load();
        const text = docs?.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const docLoad = async (buffer: any): Promise<string> => {
    try {
        const extractor = new WordExtractor();
        const extracted = await extractor.extract(buffer);
        const text = extracted.getBody();
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const chatbotLists = async (req: CustomRequest): Promise<ChatbotResponse> => {
    try {
        const { _id: userId } = req.userData!;
        const query = { userId: userId }
        const populate = [
            {
                path: "textId",
                select: "text type fileName documentId"
            }
        ]
        const data: Chatbot[] = await Models.chatbotModel.find(query, projection, optionWithSortDesc).populate(populate);
        const count = await Models.chatbotModel.countDocuments(query);
        const response: ChatbotResponse = {
            count: count,
            data: data
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const deleteChatbot = async (req: CustomRequest): Promise<MessageResponse> => {
    try {
        const { documentId } = req.query;
        const { _id: userId } = req.userData!;
        await session.run(
            `
                    MATCH (n:Chunk {documentId: $documentId})
                    DELETE n
                    `,
            { documentId: documentId }
        );
        const query = { userId: userId, documentId: documentId }
        await Models.textModel.deleteMany(query);
        await Models.chatbotModel.deleteOne(query);
        await Models.formModel.deleteOne({ documentId: documentId });
        const query1 = { documentId: documentId }
        await deleteSessions(query1);
        const response: MessageResponse = {
            message: "Chatbot Deleted Successfully"
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const deleteSessions = async (query: object) => {
    try {
        const fetchIps: Ips[] = await Models.ipAddressModel.find(query, projection, option)
        if (fetchIps?.length) {
            const ids = fetchIps.map((item) => item?._id);
            await Models.chatSessionModel.deleteMany({ ipAddressId: { $in: ids } });
        }
        await Models.ipAddressModel.deleteMany(query)
        await Models.messageModel.deleteMany(query);
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const chatHistory = async (req: CustomRequest): Promise<ChatHistory> => {
    try {
        const { documentId, pagination, limit, startDate, endDate } = req.query;
        const setPagination = pagination ?? 1;
        const setLimit = limit ?? 10
        const query: any = [
            await ChatHistoryAggregation.matchData(documentId?.toString()!),
            await ChatHistoryAggregation.lookupChatSessions(),
            await ChatHistoryAggregation.unwindChatSessions(),
            await ChatHistoryAggregation.lookupMessages(),
            await ChatHistoryAggregation.redactData(Number(startDate), Number(endDate)),
            await ChatHistoryAggregation.groupData(),
            await ChatHistoryAggregation.facetData(+setPagination, +setLimit)
        ];
        const fetchData = await Models.ipAddressModel.aggregate(query);
        const response: ChatHistory = {
            count: fetchData[0]?.count[0]?.count ?? 0,
            data: fetchData[0]?.data ?? []
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const chatDetail = async (req: CustomRequest): Promise<MessageResponseList> => {
    try {
        const { sessionId, pagination, limit } = req.query;
        const query = { sessionId: new Types.ObjectId(sessionId as string) }
        const options = CommonHelper.setOptions(+pagination!, +limit!, { _id: 1 });
        const fetchData: Message[] = await Models.messageModel.find(query, projection, options);
        const count = await Models.messageModel.countDocuments(query);
        const response: MessageResponseList = {
            count: count,
            data: fetchData
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const createTheme = async (req: Request): Promise<Response> => {
    try {
        const { theme } = req.body;
        const fetchData = await Models.themeModel.findOne({}, projection, option);
        if (fetchData) {
            const { _id } = fetchData;
            const update = { theme: theme };
            let updateData = await Models.themeModel.findOneAndUpdate({ _id: _id }, update, options);
            const response: Response = {
                message: "Theme created successfully",
                data: updateData!
            }
            return response;
        }
        else {
            const dataToSave = {
                theme,
                createdAt: moment().utc().valueOf()
            }
            const saveData = await Models.themeModel.create(dataToSave);
            const response: Response = {
                message: "Theme created successfully",
                data: saveData
            }
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const themeList = async (req: Request): Promise<ResponseList> => {
    try {
        const data = await Models.themeModel.find({}, projection, option);
        const count = await Models.themeModel.countDocuments({});
        const response: ResponseList = {
            count: count,
            data: data
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}


const formAdd = async (req: Request): Promise<FormResponse> => {
    try {
        const { documentId, fields } = req.body;
        const dataToSave = {
            documentId: documentId,
            fields,
            createdAt: moment().utc().valueOf()
        }
        const saveData = await Models.formModel.create(dataToSave);
        const response: FormResponse = {
            message: "Added successfully",
            data: saveData
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const formUpdate = async (req: Request): Promise<FormResponse> => {
    try {
        const { _id, fields } = req.body;
        const dataToUpdate = {
            fields,
            updatedAt: moment().utc().valueOf()
        }
        const updatedData = await Models.formModel.findOneAndUpdate({ _id: new Types.ObjectId(_id) }, dataToUpdate, options);
        const response: FormResponse = {
            message: "Updated Successfully",
            data: updatedData!
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const formDetail = async (req: Request): Promise<Forms> => {
    try {
        const { documentId } = req.query;
        const fetchData: Forms | null = await Models.formModel.findOne({ documentId: documentId }, projection, option);
        return fetchData ?? {};
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const formChatbot = async (req: Request): Promise<FormChatbot> => {
    try {
        const { documentId } = req.query;
        // console.log("req.ip---", req.ip);
        // const ipAddress = req.ip;
        const fetchData: Forms | null = await Models.formModel.findOne({ documentId: documentId }, projection, option);
        // let isFormCompleted = false;
        // if (fetchData) {
        //     const query = { documentId: documentId, ipAddress: ipAddress };
        //     const fetchIpData = await Models.ipAddressModel.findOne(query, projection, option);
        //     console.log("fetchIpData----", fetchIpData)
        //     if (fetchIpData) {
        //         const currentTime = moment().utc().valueOf();
        //         console.log("currentTime---", currentTime);
        //         console.log("fetchIpData.createdAt---", fetchIpData.createdAt)
        //         // const differenceInHours = moment(currentTime).diff(moment(fetchIpData.createdAt), 'hours');
        //         const differenceInMinutes = moment(currentTime).diff(moment(fetchIpData.createdAt), 'minutes');
        //         console.log("differenceInMinutes----", differenceInMinutes)
        //         if (differenceInMinutes < 5) {
        //             const fetchSessions = await Models.chatSessionModel.findOne({ ipAddressId: fetchIpData._id }, projection, optionWithSortDesc);

        //             if (fetchSessions!.isFormCompleted == true) {
        //                 isFormCompleted = true
        //             }
        //         }
        //         else {
        //             const updateData = { createdAt: currentTime }
        //             await Models.ipAddressModel.findOneAndUpdate(query, updateData, options);
        //         }
        //     }
        // }

        const response: FormChatbot = {
            // isFormCompleted: isFormCompleted,
            data: fetchData ?? {}
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const formWithIp = async (req: Request): Promise<FormResponse> => {
    try {
        const { documentId } = req.query;
        const ipAddress = req.ip;
        const query = { ipAddress: ipAddress, documentId: documentId };
        const fetchUserInfo = await Models.infoModel.findOne(query, projection, option);
        if (!fetchUserInfo) {
            const query = { documentId: documentId }
            const fetchFormData = await Models.formModel.findOne(query, projection, option);
            const response: FormResponse | null = {
                message: "Form Data",
                data: fetchFormData!
            }
            return response;
        }
        else {
            const response: FormResponse = {
                message: "Form Added"
            }
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const formInfoAdd = async (req: Request): Promise<UserInfoResponse> => {
    try {
        const ipAddress = req.ip;
        const { documentId, fields } = req.body;
        const dataToSave = {
            documentId, ipAddress, fields,
            createdAt: moment().utc().valueOf()
        }
        const saveData = await Models.infoModel.create(dataToSave);
        const response: UserInfoResponse = {
            message: "Form Added successfully",
            data: saveData
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
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
    chatDetail,
    createTheme,
    themeList,
    formAdd,
    formDetail,
    formUpdate,
    formWithIp,
    formInfoAdd,
    formChatbot,
    profile
}