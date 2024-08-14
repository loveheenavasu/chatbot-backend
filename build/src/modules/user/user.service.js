"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.themeList = exports.createTheme = exports.chatDetail = exports.chatHistory = exports.deleteSessions = exports.deleteChatbot = exports.chatbotLists = exports.textExtract = exports.logout = exports.deleteFile = exports.textDetail = exports.fileLists = exports.updateTexts = exports.saveTexts = exports.createSession = exports.socialLogin = exports.login = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.resendOtp = exports.verifyEmail = exports.signup = void 0;
const Models = __importStar(require("../../models/index"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const Handler = __importStar(require("../../handler/handler"));
const error_1 = require("../../handler/error");
const CommonHelper = __importStar(require("../../common/common"));
const openai_1 = require("@langchain/openai");
const neo4j_1 = require("../../config/neo4j");
const neo4j_vector_1 = require("@langchain/community/vectorstores/neo4j_vector");
const documents_1 = require("@langchain/core/documents");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const csv_1 = require("@langchain/community/document_loaders/fs/csv");
const docx_1 = require("@langchain/community/document_loaders/fs/docx");
const path_1 = __importDefault(require("path"));
const word_extractor_1 = __importDefault(require("word-extractor"));
const textsplitters_1 = require("@langchain/textsplitters");
const text_model_1 = require("../../models/text.model");
const user_model_1 = require("../../models/user.model");
const ChatHistoryAggregation = __importStar(require("./aggregation/chat-history.aggregation"));
const EmailService = __importStar(require("../../common/emailService"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { v4: uuidv4 } = require('uuid');
const OPEN_API_KEY = process.env.OPEN_API_KEY;
const NEO_URL = process.env.NEO_URL;
const NEO_USERNAME = process.env.NEO_USERNAME;
const NEO_PASSWORD = process.env.NEO_PASSWORD;
const SCOPE = process.env.SCOPE;
const openai = new openai_1.OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY
});
const neoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};
const projection = { __v: 0 };
const option = { lean: true };
const options = { new: true };
const optionWithSortDesc = { lean: true, sort: { _id: -1 } };
const optionWithSortAsc = { lean: true, sort: { _id: 1 } };
const signup = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail };
        const user = yield Models.userModel.findOne(query, projection, option);
        if (user) {
            if (user.isEmailVerified)
                return Handler.handleCustomError(error_1.EmailAlreadyExists);
            yield Models.sessionModel.deleteMany({ userId: user._id });
            const updatedData = yield updateUser(user._id, req.body);
            yield EmailService.verificationCode(updatedData === null || updatedData === void 0 ? void 0 : updatedData.email, updatedData === null || updatedData === void 0 ? void 0 : updatedData.otp);
            delete updatedData._doc.otp;
            const response = {
                message: `Otp sent to ${updatedData.email}`,
                data: updatedData
            };
            return response;
        }
        else {
            const newUser = yield createNewUser(req.body);
            yield EmailService.verificationCode(newUser === null || newUser === void 0 ? void 0 : newUser.email, newUser === null || newUser === void 0 ? void 0 : newUser.otp);
            newUser === null || newUser === void 0 ? true : delete newUser._doc.otp;
            const response = {
                message: `Otp sent to ${newUser === null || newUser === void 0 ? void 0 : newUser.email}`,
                data: newUser
            };
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.signup = signup;
const createNewUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield signupData(payload);
        const user = yield Models.userModel.create(data);
        user._doc.accessToken = yield fetchToken(user._id, SCOPE);
        delete user._doc.password;
        return user;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const updateUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield signupData(payload);
        const updatedUser = yield Models.userModel.findOneAndUpdate({ _id: userId }, data, options);
        updatedUser._doc.accessToken = yield fetchToken(updatedUser._id, SCOPE);
        delete updatedUser._doc.password;
        return updatedUser;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const signupData = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bcryptPass = yield CommonHelper.hashPassword(payload === null || payload === void 0 ? void 0 : payload.password);
        const otp = CommonHelper.generateOtp();
        const data = {
            email: payload === null || payload === void 0 ? void 0 : payload.email.toLowerCase(),
            password: bcryptPass,
            otp: otp,
            firstname: payload.firstname,
            lastname: payload.lastname,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        return data;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const fetchToken = (userId, scope) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = { _id: userId, scope: scope };
        const accessToken = yield CommonHelper.signToken(tokenData);
        return accessToken;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const verifyEmail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp: inputOtp } = req.body;
        const { _id } = req.userData;
        const query = { _id: _id };
        const fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            if (inputOtp === fetchData.otp) {
                const update = { isEmailVerified: true, otp: null };
                yield Models.userModel.findOneAndUpdate(query, update, options);
                const response = { message: "Otp verified successfully" };
                return response;
            }
            else {
                return Handler.handleCustomError(error_1.WrongOtp);
            }
        }
        else {
            return Handler.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.verifyEmail = verifyEmail;
const resendOtp = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail };
        const fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            const otp = CommonHelper.generateOtp();
            const update = { otp: otp };
            yield Models.userModel.findOneAndUpdate(query, update, options);
            yield EmailService.verificationCode(fetchData.email, otp);
            const response = { message: `Otp sent to ${email}` };
            return response;
        }
        else {
            return Handler.handleCustomError(error_1.EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.resendOtp = resendOtp;
const forgotPassword = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail, isEmailVerified: true };
        const fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            const { _id, email, type } = fetchData;
            if (type != null)
                return Handler.handleCustomError(error_1.RegisteredWithGoogle);
            const otp = CommonHelper.generateOtp();
            const query = { _id: _id };
            const update = { otp: otp };
            yield Models.userModel.findOneAndUpdate(query, update, options);
            yield EmailService.verificationCode(fetchData.email, otp);
            const response = { message: `Otp sent to ${email}` };
            return response;
        }
        else {
            return Handler.handleCustomError(error_1.EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.forgotPassword = forgotPassword;
const verifyOtp = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp: inputOtp, email } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail };
        const projection = { otp: 1 };
        const fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            if (inputOtp === fetchData.otp) {
                const uniqueCode = CommonHelper.generateUniqueCode();
                const update = { uniqueCode: uniqueCode, otp: null };
                yield Models.userModel.findOneAndUpdate(query, update, options);
                const response = {
                    message: "Otp verified successfully",
                    uniqueCode: uniqueCode
                };
                return response;
            }
            else {
                return Handler.handleCustomError(error_1.WrongOtp);
            }
        }
        else {
            return Handler.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.verifyOtp = verifyOtp;
const resetPassword = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uniqueCode, password } = req.body;
        const query = { uniqueCode: uniqueCode };
        const fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            const hashPass = yield CommonHelper.hashPassword(password);
            const update = { uniqueCode: null, password: hashPass };
            yield Models.userModel.findOneAndUpdate(query, update, options);
            const response = { message: "Password Changed Successfully" };
            return response;
        }
        else {
            return Handler.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.resetPassword = resetPassword;
const login = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const lowerCaseEmail = email.toLowerCase();
        const query = { email: lowerCaseEmail, isEmailVerified: true };
        const fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            const { _id, password: oldPassword, type } = fetchData;
            if (oldPassword == null && type != null)
                return Handler.handleCustomError(error_1.RegisteredWithGoogle);
            if (oldPassword == null)
                return Handler.handleCustomError(error_1.SomethingWentWrong);
            const decryptPass = yield CommonHelper.comparePassword(oldPassword, password);
            if (!decryptPass)
                return Handler.handleCustomError(error_1.WrongPassword);
            const data = { _id: _id, scope: SCOPE };
            const accessToken = yield CommonHelper.signToken(data);
            const resData = {
                _id: fetchData === null || fetchData === void 0 ? void 0 : fetchData._id,
                email: fetchData === null || fetchData === void 0 ? void 0 : fetchData.email,
                accessToken: accessToken
            };
            const response = {
                message: "Login successfully",
                data: resData
            };
            return response;
        }
        else {
            return Handler.handleCustomError(error_1.EmailNotRegistered);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.login = login;
const socialLogin = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, image, socialToken, isAdmin, firstname, lastname } = req.body;
        const query = { email: email.toLowerCase(), isEmailVerified: true };
        const fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            if (!fetchData.type)
                return Handler.handleCustomError(error_1.RegisteredWithPassword);
            const session = yield createSession(fetchData._id, socialToken);
            fetchData.accessToken = session.accessToken;
            return fetchData;
        }
        ;
        const dataToSave = {
            email: email.toLowerCase(),
            name,
            firstname,
            lastname,
            image,
            isAdmin,
            isEmailVerified: true,
            type: user_model_1.SignType.GOOGLE,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        const saveData = yield Models.userModel.create(dataToSave);
        const session = yield createSession(saveData._id, socialToken);
        saveData._doc['accessToken'] = session.accessToken;
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.socialLogin = socialLogin;
const createSession = (user_id, accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataToSession = {
            userId: user_id,
            accessToken: accessToken,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        const response = yield Models.sessionModel.create(dataToSession);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.createSession = createSession;
const saveTexts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text, documentId } = req.body;
        const { _id } = req.userData;
        let num = 1, docId = uuidv4(), data;
        const query = { userId: new mongoose_1.Types.ObjectId(_id), documentId: documentId };
        const fetchChatbot = yield Models.chatbotModel.findOne(query, projection, optionWithSortDesc);
        if (!fetchChatbot) {
            data = yield embedText(text, text_model_1.Type.TEXT, _id, undefined, num, docId);
            yield createChatbot(data);
        }
        else {
            const fetchData = yield Models.textModel.findOne(query, projection, optionWithSortDesc);
            if (fetchData) {
                let { docNo, documentId } = fetchData;
                docNo = docNo + 1;
                num = docNo;
                docId = documentId;
            }
            data = yield embedText(text, text_model_1.Type.TEXT, _id, undefined, num, docId);
        }
        const response = {
            message: "Text Added Successfully",
            data: data
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.saveTexts = saveTexts;
const createChatbot = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, userId, documentId } = data;
        const dataToSave = {
            textId: _id,
            userId: userId,
            documentId: documentId,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        const response = yield Models.chatbotModel.create(dataToSave);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const embedText = (text, type, userId, fileName, docNo, docId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
        const docOutput = yield textSplitter.splitDocuments([
            new documents_1.Document({ pageContent: text, metadata: { documentId: docId === null || docId === void 0 ? void 0 : docId.toString(), docNo: docNo } })
        ]);
        docOutput.forEach(doc => {
            if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                doc.metadata.loc = doc.metadata.loc.toString();
            }
        });
        yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
        const dataToSave = {
            text,
            userId,
            type,
            fileName,
            docNo,
            documentId: docId,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        const saveData = yield Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const updateTexts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, text } = req.body;
        const query = { _id: new mongoose_1.Types.ObjectId(_id) };
        const fetchData = yield Models.textModel.findOne(query, projection, option);
        if (fetchData) {
            const { documentId, docNo } = fetchData;
            yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `, { documentId: documentId, docNo: docNo });
            const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
            const docOutput = yield textSplitter.splitDocuments([
                new documents_1.Document({ pageContent: text, metadata: { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString(), docNo: docNo } }),
            ]);
            docOutput.forEach(doc => {
                var _a, _b, _c, _d;
                if (((_a = doc === null || doc === void 0 ? void 0 : doc.metadata) === null || _a === void 0 ? void 0 : _a.loc) && typeof ((_b = doc === null || doc === void 0 ? void 0 : doc.metadata) === null || _b === void 0 ? void 0 : _b.loc) === 'object') {
                    doc.metadata.loc = (_d = (_c = doc === null || doc === void 0 ? void 0 : doc.metadata) === null || _c === void 0 ? void 0 : _c.loc) === null || _d === void 0 ? void 0 : _d.toString(); // Convert object to string representation
                }
            });
            yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
            const update = {
                text: text,
                docNo: docNo,
                updatedAt: (0, moment_1.default)().utc().valueOf()
            };
            yield Models.textModel.updateOne(query, update);
            const response = { message: "Text updated successfully" };
            return response;
        }
        else {
            return Handler.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.updateTexts = updateTexts;
const fileLists = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, pagination, limit } = req.query;
        const { _id: userId } = req.userData;
        const query = {
            userId: new mongoose_1.Types.ObjectId(userId),
            type: text_model_1.Type.FILE,
            documentId: documentId
        };
        const option = CommonHelper.setOptions(+pagination, +limit);
        const fetchdata = yield Models.textModel.find(query, projection, option);
        const count = yield Models.textModel.countDocuments(query);
        const response = {
            count: count,
            data: fetchdata
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.fileLists = fileLists;
const textDetail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.userData;
        const { documentId } = req.query;
        const query = {
            userId: new mongoose_1.Types.ObjectId(_id),
            type: text_model_1.Type.TEXT,
            documentId: documentId
        };
        const response = yield Models.textModel.findOne(query, projection, optionWithSortDesc);
        return response !== null && response !== void 0 ? response : {};
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.textDetail = textDetail;
const deleteFile = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { docNo, documentId } = req.query;
        const { _id: userId } = req.userData;
        const query = { documentId: documentId, docNo: Number(docNo) };
        yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `, { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString(), docNo: Number(docNo) });
        yield Models.textModel.deleteOne(query);
        const query1 = { documentId: documentId };
        const fetchData = yield Models.textModel.findOne(query1, projection, optionWithSortAsc);
        if (fetchData) {
            const { _id: textId } = fetchData;
            const query = { documentId: documentId, userId: userId };
            const update = { textId: textId };
            yield Models.chatbotModel.findOneAndUpdate(query, update, options);
        }
        else {
            yield Models.chatbotModel.deleteOne(query1);
        }
        const response = { message: "Deleted Successfully" };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.deleteFile = deleteFile;
const logout = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Models.sessionModel.deleteOne({ accessToken: req.userData.accessToken });
        const response = { message: "Logout Successfully" };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.logout = logout;
const updateFileText = (text, type, documentId, userId, fileName, docNo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
        const docOutput = yield textSplitter.splitDocuments([
            new documents_1.Document({ pageContent: text, metadata: { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString(), docNo: docNo } }),
        ]);
        docOutput.forEach(doc => {
            if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                doc.metadata.loc = doc.metadata.loc.toString();
            }
        });
        yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
        const dataToSave = {
            text,
            userId,
            type,
            fileName,
            documentId,
            docNo,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        const saveData = yield Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const textExtract = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { documentId } = req.body;
        const { _id: userId } = req.userData;
        const textData = yield extract(req.file.originalname, req.file.buffer);
        let docId = uuidv4();
        const query = { userId: new mongoose_1.Types.ObjectId(userId), documentId: documentId };
        const fetchChatbot = yield Models.chatbotModel.findOne(query, projection, optionWithSortDesc);
        let data;
        if (!fetchChatbot) {
            data = yield embedText(textData, text_model_1.Type.FILE, userId, (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.originalname, 1, docId);
            yield createChatbot(data);
        }
        else {
            const fetchData = yield Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                docNo = docNo + 1;
                data = yield updateFileText(textData, text_model_1.Type.FILE, documentId, userId, (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.originalname, docNo);
            }
        }
        const response = {
            message: "File Added Successfully",
            data: data
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.textExtract = textExtract;
const extract = (originalname, buffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const extension = path_1.default.extname(originalname).toLowerCase();
        let text;
        const blob = new Blob([buffer]);
        switch (extension) {
            case ".pdf":
                text = yield pdfLoad(blob);
                break;
            case ".txt":
                text = yield textLoad(buffer);
                break;
            case ".csv":
                text = yield csvLoad(blob);
                break;
            case ".docx":
                text = yield docxLoad(blob);
                break;
            case ".doc":
                text = yield docLoad(buffer);
                break;
            default: return Handler.handleCustomError(error_1.UnsupportedFileType);
        }
        const textData = text.trim();
        return textData;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const pdfLoad = (blob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loader = new pdf_1.PDFLoader(blob);
        const docs = yield loader.load();
        const text = docs === null || docs === void 0 ? void 0 : docs.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const textLoad = (buffer) => {
    try {
        const text = buffer.toString();
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
};
const csvLoad = (blob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loader = new csv_1.CSVLoader(blob);
        const docs = yield loader.load();
        const text = docs === null || docs === void 0 ? void 0 : docs.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const docxLoad = (blob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loader = new docx_1.DocxLoader(blob);
        const docs = yield loader.load();
        const text = docs === null || docs === void 0 ? void 0 : docs.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const docLoad = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const extractor = new word_extractor_1.default();
        const extracted = yield extractor.extract(buffer);
        const text = extracted.getBody();
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const chatbotLists = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id: userId } = req.userData;
        const query = { userId: userId };
        const populate = [
            {
                path: "textId",
                select: "text type fileName documentId"
            }
        ];
        const data = yield Models.chatbotModel.find(query, projection, optionWithSortDesc).populate(populate);
        const count = yield Models.chatbotModel.countDocuments(query);
        const response = {
            count: count,
            data: data
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.chatbotLists = chatbotLists;
const deleteChatbot = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId } = req.query;
        const { _id: userId } = req.userData;
        yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId})
                    DELETE n
                    `, { documentId: documentId });
        const query = { userId: userId, documentId: documentId };
        yield Models.textModel.deleteMany(query);
        yield Models.chatbotModel.deleteOne(query);
        const query1 = { documentId: documentId };
        yield deleteSessions(query1);
        const response = {
            message: "Chatbot Deleted Successfully"
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.deleteChatbot = deleteChatbot;
const deleteSessions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fetchIps = yield Models.ipAddressModel.find(query, projection, option);
        if (fetchIps === null || fetchIps === void 0 ? void 0 : fetchIps.length) {
            const ids = fetchIps.map((item) => item === null || item === void 0 ? void 0 : item._id);
            yield Models.chatSessionModel.deleteMany({ ipAddressId: { $in: ids } });
        }
        yield Models.ipAddressModel.deleteMany(query);
        yield Models.messageModel.deleteMany(query);
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.deleteSessions = deleteSessions;
const chatHistory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { documentId, pagination, limit } = req.query;
        const setPagination = pagination !== null && pagination !== void 0 ? pagination : 1;
        const setLimit = limit !== null && limit !== void 0 ? limit : 10;
        const query = [
            yield ChatHistoryAggregation.matchData(documentId === null || documentId === void 0 ? void 0 : documentId.toString()),
            yield ChatHistoryAggregation.lookupChatSessions(),
            yield ChatHistoryAggregation.unwindChatSessions(),
            yield ChatHistoryAggregation.lookupMessages(),
            yield ChatHistoryAggregation.groupData(),
            yield ChatHistoryAggregation.facetData(+setPagination, +setLimit)
        ];
        const fetchData = yield Models.ipAddressModel.aggregate(query);
        const response = {
            count: (_c = (_b = (_a = fetchData[0]) === null || _a === void 0 ? void 0 : _a.count[0]) === null || _b === void 0 ? void 0 : _b.count) !== null && _c !== void 0 ? _c : 0,
            data: (_e = (_d = fetchData[0]) === null || _d === void 0 ? void 0 : _d.data) !== null && _e !== void 0 ? _e : []
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.chatHistory = chatHistory;
const chatDetail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId, pagination, limit } = req.query;
        const query = { sessionId: new mongoose_1.Types.ObjectId(sessionId) };
        const options = CommonHelper.setOptions(+pagination, +limit, { _id: 1 });
        const fetchData = yield Models.messageModel.find(query, projection, options);
        const count = yield Models.messageModel.countDocuments(query);
        const response = {
            count: count,
            data: fetchData
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.chatDetail = chatDetail;
const createTheme = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { theme } = req.body;
        const fetchData = yield Models.themeModel.findOne({}, projection, option);
        if (fetchData) {
            const { _id } = fetchData;
            const update = { theme: theme };
            let updateData = yield Models.themeModel.findOneAndUpdate({ _id: _id }, update, options);
            const response = {
                message: "Theme created successfully",
                data: updateData
            };
            return response;
        }
        else {
            const dataToSave = {
                theme,
                createdAt: (0, moment_1.default)().utc().valueOf()
            };
            const saveData = yield Models.themeModel.create(dataToSave);
            const response = {
                message: "Theme created successfully",
                data: saveData
            };
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.createTheme = createTheme;
const themeList = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield Models.themeModel.find({}, projection, option);
        const count = yield Models.themeModel.countDocuments({});
        const response = {
            count: count,
            data: data
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.themeList = themeList;
