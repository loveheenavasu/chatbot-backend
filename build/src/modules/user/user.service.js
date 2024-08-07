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
exports.chatDetail = exports.chatHistory = exports.deleteSessions = exports.deleteChatbot = exports.chatbotLists = exports.textExtract = exports.logout = exports.deleteFile = exports.textDetail = exports.fileLists = exports.updateTexts = exports.saveTexts = exports.createSession = exports.socialLogin = exports.login = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.resendOtp = exports.verifyEmail = exports.signup = void 0;
const Models = __importStar(require("../../models/index"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const Handler = __importStar(require("../../handler/handler"));
const error_1 = require("../../handler/error");
const CommonHelper = __importStar(require("../../common/common"));
const openai_1 = require("@langchain/openai");
const dotenv_1 = require("dotenv");
const neo4j_1 = require("../../config/neo4j");
(0, dotenv_1.config)();
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
let neoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};
const signup = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email } = req.body;
        let query = { email: email.toLowerCase() };
        let projection = { __v: 0 };
        let options = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, options);
        if (fetchData) {
            let { _id, isEmailVerified } = fetchData;
            if (isEmailVerified)
                return Handler.handleCustomError(error_1.EmailAlreadyExists);
            let query1 = { userId: _id };
            yield Models.sessionModel.deleteMany(query1);
            let data = yield signupData(req.body);
            let options = { new: true };
            let updateData = yield Models.userModel.findOneAndUpdate(query, data, options);
            let accessToken = yield fetchToken(updateData === null || updateData === void 0 ? void 0 : updateData._id, SCOPE);
            updateData._doc["accessToken"] = accessToken;
            delete updateData._doc["password"];
            delete updateData._doc["otp"];
            yield EmailService.verificationCode(email, data.otp);
            let response = {
                message: `Otp sent to ${updateData === null || updateData === void 0 ? void 0 : updateData.email}`,
                data: updateData
            };
            return response;
        }
        else {
            let data = yield signupData(req.body);
            let saveData = yield Models.userModel.create(data);
            let accessToken = yield fetchToken(saveData === null || saveData === void 0 ? void 0 : saveData._id, SCOPE);
            saveData._doc["accessToken"] = accessToken;
            delete saveData._doc["password"];
            delete saveData._doc["otp"];
            yield EmailService.verificationCode(email, data.otp);
            let response = {
                message: `Otp sent to ${saveData === null || saveData === void 0 ? void 0 : saveData.email}`,
                data: saveData
            };
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.signup = signup;
const signupData = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let bcryptPass = yield CommonHelper.hashPassword(payload === null || payload === void 0 ? void 0 : payload.password);
        let otp = CommonHelper.generateOtp();
        let data = {
            email: payload === null || payload === void 0 ? void 0 : payload.email.toLowerCase(),
            password: bcryptPass,
            otp: otp,
            firstname: payload === null || payload === void 0 ? void 0 : payload.firstname,
            lastname: payload === null || payload === void 0 ? void 0 : payload.lastname,
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
        let tokenData = {
            _id: userId,
            scope: scope
        };
        let accessToken = yield CommonHelper.signToken(tokenData);
        return accessToken;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const verifyEmail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { otp: inputOtp } = req.body;
        let { _id } = req.userData;
        let query = { _id: _id };
        let projection = { otp: 1, email: 1 };
        let option = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            let { otp, email } = fetchData;
            if (inputOtp === otp) {
                let update = {
                    isEmailVerified: true,
                    otp: null
                };
                let options = { new: true };
                yield Models.userModel.findOneAndUpdate(query, update, options);
                let query1 = { email: email, isEmailVerified: false };
                let projection = { _id: 1 };
                let fetchUnverified = yield Models.userModel.find(query1, projection, option);
                if (fetchUnverified === null || fetchUnverified === void 0 ? void 0 : fetchUnverified.length) {
                    yield Models.userModel.deleteMany(query1);
                    for (let i = 0; i < (fetchUnverified === null || fetchUnverified === void 0 ? void 0 : fetchUnverified.length); i++) {
                        let { _id } = fetchUnverified[i];
                        let query = { userId: _id };
                        yield Models.sessionModel.deleteOne(query);
                    }
                }
                let response = {
                    message: "Otp verified successfully"
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
exports.verifyEmail = verifyEmail;
const resendOtp = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email } = req.body;
        let query = { email: email === null || email === void 0 ? void 0 : email.toLowerCase() };
        let fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            let { email } = fetchData;
            let otp = CommonHelper.generateOtp();
            let update = {
                otp: otp
            };
            let option = { new: true };
            yield Models.userModel.findOneAndUpdate(query, update, option);
            yield EmailService.verificationCode(email, otp);
            let response = {
                message: `Otp sent to ${email}`
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
exports.resendOtp = resendOtp;
const forgotPassword = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email } = req.body;
        let query = { email: email.toLowerCase() };
        let fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            let { _id, email } = fetchData;
            let otp = CommonHelper.generateOtp();
            let query = { _id: _id };
            let update = { otp: otp };
            let option = { new: true };
            yield Models.userModel.findOneAndUpdate(query, update, option);
            yield EmailService.verificationCode(email, otp);
            let response = {
                message: `Otp sent to ${email}`
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
exports.forgotPassword = forgotPassword;
const verifyOtp = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { otp: inputOtp, email } = req.body;
        let query = { email: email === null || email === void 0 ? void 0 : email.toLowerCase() };
        let projection = { otp: 1 };
        let option = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            let { otp } = fetchData;
            if (inputOtp === otp) {
                let uniqueCode = yield CommonHelper.generateUniqueCode();
                let update = {
                    uniqueCode: uniqueCode,
                    otp: null
                };
                let options = { new: true };
                yield Models.userModel.findOneAndUpdate(query, update, options);
                let response = {
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
        let { uniqueCode, password } = req.body;
        let query = { uniqueCode: uniqueCode };
        let fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            let hashPass = yield CommonHelper.hashPassword(password);
            let update = {
                uniqueCode: null,
                password: hashPass
            };
            let options = { new: true };
            yield Models.userModel.findOneAndUpdate(query, update, options);
            let response = {
                message: "Password Changed Successfully"
            };
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
        let { email, password } = req.body;
        let query = { email: email.toLowerCase(), isEmailVerified: true };
        let projection = { __v: 0 };
        let option = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            let { _id, password: oldPassword, type } = fetchData;
            if (oldPassword == null && type != null) {
                return Handler.handleCustomError(error_1.RegisteredWithGoogle);
            }
            if (oldPassword == null) {
                return Handler.handleCustomError(error_1.SomethingWentWrong);
            }
            let decryptPass = yield CommonHelper.comparePassword(oldPassword, password);
            if (!decryptPass) {
                return Handler.handleCustomError(error_1.WrongPassword);
            }
            else {
                let data = {
                    _id: _id,
                    scope: SCOPE
                };
                let accessToken = yield CommonHelper.signToken(data);
                let resData = {
                    _id: fetchData === null || fetchData === void 0 ? void 0 : fetchData._id,
                    email: fetchData === null || fetchData === void 0 ? void 0 : fetchData.email,
                    accessToken: accessToken
                };
                let response = {
                    message: "Login successfully",
                    data: resData
                };
                return response;
            }
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
        let { email, name, image, socialToken, isAdmin, firstname, lastname } = req.body;
        let query = { email: email.toLowerCase() };
        let fetchData = yield CommonHelper.fetchUser(query);
        if (fetchData) {
            let session = yield createSession(fetchData === null || fetchData === void 0 ? void 0 : fetchData._id, socialToken);
            fetchData.accessToken = session === null || session === void 0 ? void 0 : session.accessToken;
            return fetchData;
        }
        let dataToSave = {
            email: email.toLowerCase(),
            name: name,
            firstname: firstname,
            lastname: lastname,
            image: image,
            isAdmin: isAdmin,
            isEmailVerified: true,
            type: user_model_1.signType === null || user_model_1.signType === void 0 ? void 0 : user_model_1.signType.GOOGLE,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let userData = yield Models.userModel.create(dataToSave);
        let session = yield createSession(userData === null || userData === void 0 ? void 0 : userData._id, socialToken);
        userData._doc['accessToken'] = session === null || session === void 0 ? void 0 : session.accessToken;
        return userData;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.socialLogin = socialLogin;
const createSession = (user_id, accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let dataToSession = {
            userId: user_id,
            accessToken: accessToken,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let response = yield Models.sessionModel.create(dataToSession);
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
        let { _id } = req.userData;
        let num = 1;
        let docId = uuidv4();
        let query = { userId: new mongoose_1.Types.ObjectId(_id), documentId: documentId };
        let projection = { __v: 0 };
        let option = { lean: true, sort: { _id: -1 } };
        let data;
        let fetchChatbot = yield Models.chatbotModel.findOne(query, projection, option);
        if (!fetchChatbot) {
            data = yield embedText(text, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.TEXT, _id, undefined, num, docId);
            yield createChatbot(data);
        }
        else {
            let fetchData = yield Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { docNo, documentId } = fetchData;
                docNo = docNo + 1;
                num = docNo;
                docId = documentId;
            }
            data = yield embedText(text, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.TEXT, _id, undefined, num, docId);
        }
        let response = {
            messgage: "Text Added Successfully",
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
        let { _id, userId, documentId } = data;
        let dataToSave = {
            textId: _id,
            userId: userId,
            documentId: documentId,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let response = yield Models.chatbotModel.create(dataToSave);
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
        let dataToSave = {
            text: text,
            userId: userId,
            type: type,
            fileName: fileName,
            documentId: docId,
            docNo: docNo,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let saveData = yield Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const updateTexts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, text } = req.body;
        let query = { _id: new mongoose_1.Types.ObjectId(_id) };
        let projection = { __v: 0 };
        let options = { lean: true };
        let fetchData = yield Models.textModel.findOne(query, projection, options);
        if (fetchData) {
            let { documentId, docNo } = fetchData;
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
            const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
            let update = {
                text: text,
                docNo: docNo,
                updatedAt: (0, moment_1.default)().utc().valueOf()
            };
            yield Models.textModel.updateOne(query, update);
            let response = {
                message: "Text updated successfully"
            };
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
    var _a, _b, _c;
    try {
        let { _id: userId } = req.userData;
        let query = {
            userId: new mongoose_1.Types.ObjectId(userId),
            type: text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE,
            documentId: (_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.documentId
        };
        let projection = { __v: 0 };
        let option = yield CommonHelper.setOptions(+((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.pagination), +((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.limit));
        let fetchdata = yield Models.textModel.find(query, projection, option);
        let count = yield Models.textModel.countDocuments(query);
        let response = {
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
        let { _id } = req.userData;
        let { documentId } = req.query;
        let query = {
            userId: new mongoose_1.Types.ObjectId(_id),
            type: text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.TEXT,
            documentId: documentId
        };
        let projection = { __v: 0 };
        let options = { lean: true, sort: { _id: -1 } };
        let data = yield Models.textModel.findOne(query, projection, options);
        let response = data !== null && data !== void 0 ? data : {};
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.textDetail = textDetail;
const deleteFile = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { docNo, documentId } = req.query;
        let { _id: userId } = req.userData;
        let query = { documentId: documentId, docNo: Number(docNo) };
        yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `, { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString(), docNo: Number(docNo) });
        yield Models.textModel.deleteOne(query);
        let query1 = { documentId: documentId };
        let projection = { __v: 0 };
        let options = { lean: true, sort: { _id: 1 } };
        let fetchData = yield Models.textModel.findOne(query1, projection, options);
        if (fetchData) {
            let { _id: textId } = fetchData;
            let query = {
                documentId: documentId,
                userId: userId
            };
            let update = { textId: textId };
            let options = { new: true };
            yield Models.chatbotModel.findOneAndUpdate(query, update, options);
        }
        else {
            yield Models.chatbotModel.deleteOne(query1);
        }
        let response = {
            message: "Deleted Successfully"
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.deleteFile = deleteFile;
const logout = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { accessToken } = req.userData;
        console.log("accessToken---", accessToken);
        let query = { accessToken: accessToken };
        yield Models.sessionModel.deleteOne(query);
        let response = {
            message: "Logout Successfully"
        };
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
        let dataToSave = {
            text: text,
            userId: userId,
            type: type,
            fileName: fileName,
            documentId: documentId,
            docNo: docNo,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let saveData = yield Models.textModel.create(dataToSave);
        return saveData;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const textExtract = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        let { documentId } = req.body;
        let { _id: userId } = req.userData;
        let textData = yield extract((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.originalname, (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.buffer);
        let docId = uuidv4();
        let query = { userId: new mongoose_1.Types.ObjectId(userId), documentId: documentId };
        let projection = { __v: 0 };
        let option = { lean: true, sort: { _id: -1 } };
        let data;
        let fetchChatbot = yield Models.chatbotModel.findOne(query, projection, option);
        if (!fetchChatbot) {
            data = yield embedText(textData, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE, userId, (_c = req === null || req === void 0 ? void 0 : req.file) === null || _c === void 0 ? void 0 : _c.originalname, 1, docId);
            yield createChatbot(data);
        }
        else {
            let fetchData = yield Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                docNo = docNo + 1;
                data = yield updateFileText(textData, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE, documentId, userId, (_d = req === null || req === void 0 ? void 0 : req.file) === null || _d === void 0 ? void 0 : _d.originalname, docNo);
            }
        }
        let response = {
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
        let textData = text === null || text === void 0 ? void 0 : text.trim();
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
        const text = buffer === null || buffer === void 0 ? void 0 : buffer.toString();
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
        const extracted = yield (extractor === null || extractor === void 0 ? void 0 : extractor.extract(buffer));
        const text = extracted === null || extracted === void 0 ? void 0 : extracted.getBody();
        return text;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const chatbotLists = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { _id: userId } = req.userData;
        let query = { userId: userId };
        let projection = { __v: 0 };
        let options = { lean: true, sort: { _id: -1 } };
        let populate = [
            {
                path: "textId",
                select: "text type fileName documentId"
            }
        ];
        let data = yield Models.chatbotModel.find(query, projection, options).populate(populate);
        let count = yield Models.chatbotModel.countDocuments(query);
        let response = {
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
        let { documentId } = req.query;
        let { _id: userId } = req.userData;
        yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId})
                    DELETE n
                    `, { documentId: documentId });
        let query = {
            userId: userId,
            documentId: documentId
        };
        yield Models.textModel.deleteMany(query);
        yield Models.chatbotModel.deleteOne(query);
        let query1 = { documentId: documentId };
        yield deleteSessions(query1);
        let response = {
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
        let projection = { __v: 0 };
        let option = { lean: true };
        let fetchIps = yield Models.ipAddressModel.find(query, projection, option);
        if (fetchIps === null || fetchIps === void 0 ? void 0 : fetchIps.length) {
            let ids = fetchIps.map((item) => item === null || item === void 0 ? void 0 : item._id);
            let query1 = { ipAddressId: { $in: ids } };
            yield Models.chatSessionModel.deleteMany(query1);
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
        let { documentId, pagination, limit } = req.query;
        let setPagination = pagination !== null && pagination !== void 0 ? pagination : 1;
        let setLimit = limit !== null && limit !== void 0 ? limit : 10;
        let query = [
            yield ChatHistoryAggregation.matchData(documentId === null || documentId === void 0 ? void 0 : documentId.toString()),
            yield ChatHistoryAggregation.lookupChatSessions(),
            yield ChatHistoryAggregation.unwindChatSessions(),
            yield ChatHistoryAggregation.lookupMessages(),
            yield ChatHistoryAggregation.groupData(),
            yield ChatHistoryAggregation.facetData(+setPagination, +setLimit)
        ];
        let fetchData = yield Models.ipAddressModel.aggregate(query);
        let response = {
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
        let { sessionId, pagination, limit } = req.query;
        let query = { sessionId: new mongoose_1.Types.ObjectId(sessionId) };
        let projection = { __v: 0 };
        let options = CommonHelper.setOptions(+pagination, +limit, { _id: 1 });
        let fetchData = yield Models.messageModel.find(query, projection, options);
        let count = yield Models.messageModel.countDocuments(query);
        let response = {
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
