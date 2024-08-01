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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const Models = __importStar(require("../../models/index"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const handler_1 = __importDefault(require("../../handler/handler"));
const error_1 = require("../../handler/error");
const common_1 = __importDefault(require("../../common/common"));
const openai_1 = require("@langchain/openai");
const dotenv_1 = require("dotenv");
const neo4j_1 = require("../../config/neo4j");
(0, dotenv_1.config)();
const neo4j_vector_1 = require("@langchain/community/vectorstores/neo4j_vector");
const { OPEN_API_KEY, NEO_URL, NEO_USERNAME, NEO_PASSWORD, SCOPE } = process.env;
const documents_1 = require("@langchain/core/documents");
const { v4: uuidv4 } = require('uuid');
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const csv_1 = require("@langchain/community/document_loaders/fs/csv");
const docx_1 = require("@langchain/community/document_loaders/fs/docx");
const path_1 = __importDefault(require("path"));
const word_extractor_1 = __importDefault(require("word-extractor"));
// import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
const openai = new openai_1.OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY
});
const textsplitters_1 = require("@langchain/textsplitters");
const text_model_1 = require("../../models/text.model");
const user_model_1 = require("../../models/user.model");
const email_1 = require("../../common/email");
const chat_history_aggregation_1 = __importDefault(require("./aggregation/chat-history.aggregation"));
let neoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};
class Service {
}
_a = Service;
Service.signup = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, password } = req.body;
        let query = { email: email.toLowerCase(), isEmailVerified: true };
        let projection = { __v: 0 };
        let options = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, options);
        if (fetchData) {
            yield handler_1.default.handleCustomError(error_1.EmailAlreadyExists);
        }
        else {
            let bcryptPass = yield common_1.default.hashPass(password);
            let otp = yield common_1.default.generateOtp();
            let dataToSave = {
                email: email.toLowerCase(),
                password: bcryptPass,
                otp: otp,
                createdAt: (0, moment_1.default)().utc().valueOf()
            };
            let saveData = yield Models.userModel.create(dataToSave);
            delete saveData._doc["password"];
            delete saveData._doc["otp"];
            // console.log("save  data befor----", saveData)
            let data = {
                _id: saveData === null || saveData === void 0 ? void 0 : saveData._id,
                scope: SCOPE
            };
            let accessToken = yield common_1.default.signToken(data);
            saveData._doc["accessToken"] = accessToken;
            let emailData = {
                email: email,
                otp: otp
            };
            yield (0, email_1.sendEmail)(emailData);
            // console.log("--", saveData)
            let response = {
                message: `Otp sent to ${email}`,
                data: saveData
            };
            return response;
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.verifyEmail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { otp: inputOtp } = req.body;
        let { _id } = req.userData;
        let query = { _id: _id };
        let projection = { otp: 1, email: 1 };
        let option = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, option);
        // console.log("fetchData---", fetchData)
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
                yield handler_1.default.handleCustomError(error_1.WrongOtp);
            }
        }
        else {
            yield handler_1.default.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.resendOtp = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email } = req.body;
        let query = { email: email === null || email === void 0 ? void 0 : email.toLowerCase() };
        let fetchData = yield common_1.default.fetchUser(query);
        if (fetchData) {
            let { email } = fetchData;
            let otp = yield common_1.default.generateOtp();
            let update = {
                otp: otp
            };
            let option = { new: true };
            yield Models.userModel.findOneAndUpdate(query, update, option);
            let emailData = {
                email: email,
                otp: otp
            };
            yield (0, email_1.sendEmail)(emailData);
            let response = {
                message: `Otp sent to ${email}`
            };
            return response;
        }
        else {
            yield handler_1.default.handleCustomError(error_1.EmailNotRegistered);
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.forgotPassword = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email } = req.body;
        let query = { email: email.toLowerCase() };
        let fetchData = yield common_1.default.fetchUser(query);
        if (fetchData) {
            let { _id, email } = fetchData;
            let otp = yield common_1.default.generateOtp();
            let query = { _id: _id };
            let update = { otp: otp };
            let option = { new: true };
            yield Models.userModel.findOneAndUpdate(query, update, option);
            let emailData = {
                email: email,
                otp: otp
            };
            yield (0, email_1.sendEmail)(emailData);
            let response = {
                message: `Otp sent to ${email}`
            };
            return response;
        }
        else {
            yield handler_1.default.handleCustomError(error_1.EmailNotRegistered);
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.verifyOtp = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { otp: inputOtp, email } = req.body;
        let query = { email: email === null || email === void 0 ? void 0 : email.toLowerCase() };
        let projection = { otp: 1 };
        let option = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            let { otp } = fetchData;
            if (inputOtp === otp) {
                let uniqueCode = yield common_1.default.generateUniqueCode();
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
                yield handler_1.default.handleCustomError(error_1.WrongOtp);
            }
        }
        else {
            yield handler_1.default.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.resetPassword = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { uniqueCode, password } = req.body;
        let query = { uniqueCode: uniqueCode };
        let fetchData = yield common_1.default.fetchUser(query);
        if (fetchData) {
            let hashPass = yield common_1.default.hashPass(password);
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
            yield handler_1.default.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.login = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, password } = req.body;
        let query = { email: email.toLowerCase() };
        let projection = { __v: 0 };
        let option = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, option);
        if (fetchData) {
            let { _id, password: oldPassword, type } = fetchData;
            if (oldPassword == null) {
                yield handler_1.default.handleCustomError(error_1.SomethingWentWrong);
            }
            let decryptPass = yield common_1.default.comparePass(oldPassword, password);
            if (!decryptPass) {
                yield handler_1.default.handleCustomError(error_1.WrongPassword);
            }
            else {
                let data = {
                    _id: _id,
                    scope: SCOPE
                };
                let accessToken = yield common_1.default.signToken(data);
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
            yield handler_1.default.handleCustomError(error_1.EmailNotRegistered);
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
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
Service.socialLogin = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, name, image, socialToken, isAdmin } = req.body;
        let query = { email: email.toLowerCase() };
        let fetchData = yield common_1.default.fetchUser(query);
        if (fetchData) {
            let { _id } = fetchData;
            let session = yield _a.createSession(_id, socialToken);
            fetchData.accessToken = session === null || session === void 0 ? void 0 : session.accessToken;
            return fetchData;
        }
        let dataToSave = {
            email: email.toLowerCase(),
            name: name,
            image: image,
            isAdmin: isAdmin,
            isEmailVerified: true,
            type: user_model_1.signType === null || user_model_1.signType === void 0 ? void 0 : user_model_1.signType.GOOGLE,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let userData = yield Models.userModel.create(dataToSave);
        let session = yield _a.createSession(userData === null || userData === void 0 ? void 0 : userData._id, socialToken);
        userData._doc['accessToken'] = session === null || session === void 0 ? void 0 : session.accessToken;
        return userData;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.createSession = (user_id, accessToken) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield handler_1.default.handleCustomError(err);
    }
});
Service.saveTexts = (req) => __awaiter(void 0, void 0, void 0, function* () {
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
            data = yield _a.embedText(text, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.TEXT, _id, null, num, docId);
            yield _a.createChatbot(data);
        }
        else {
            let fetchData = yield Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { docNo, documentId } = fetchData;
                docNo = docNo + 1;
                num = docNo;
                docId = documentId;
            }
            data = yield _a.embedText(text, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.TEXT, _id, null, num, docId);
        }
        let response = {
            messgage: "Text Added Successfully",
            data: data
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.createChatbot = (data) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield handler_1.default.handleCustomError(err);
    }
});
Service.embedText = (text, type, userId, fileName, docNo, docId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
        const docOutput = yield textSplitter.splitDocuments([
            new documents_1.Document({ pageContent: text, metadata: { documentId: docId === null || docId === void 0 ? void 0 : docId.toString(), docNo: docNo } }), // Ensure id is converted to string
        ]);
        docOutput.forEach(doc => {
            if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                doc.metadata.loc = doc.metadata.loc.toString();
            }
        });
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
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
        yield handler_1.default.handleCustomError(err);
    }
});
Service.updateTexts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, text } = req.body;
        let { _id: userId } = req.userData;
        let query = { _id: new mongoose_1.Types.ObjectId(_id) };
        let projection = { __v: 0 };
        let options = { lean: true };
        let fetchData = yield Models.textModel.findOne(query, projection, options);
        if (fetchData) {
            let { documentId, docNo } = fetchData;
            const result = yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `, { documentId: documentId, docNo: docNo });
            const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
            const docOutput = yield textSplitter.splitDocuments([
                new documents_1.Document({ pageContent: text, metadata: { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString(), docNo: docNo } }), // Ensure id is converted to string
            ]);
            docOutput.forEach(doc => {
                var _b, _c, _d, _e;
                if (((_b = doc === null || doc === void 0 ? void 0 : doc.metadata) === null || _b === void 0 ? void 0 : _b.loc) && typeof ((_c = doc === null || doc === void 0 ? void 0 : doc.metadata) === null || _c === void 0 ? void 0 : _c.loc) === 'object') {
                    doc.metadata.loc = (_e = (_d = doc === null || doc === void 0 ? void 0 : doc.metadata) === null || _d === void 0 ? void 0 : _d.loc) === null || _e === void 0 ? void 0 : _e.toString(); // Convert object to string representation
                }
            });
            const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
            let update = {
                text: text,
                docNo: docNo,
                updatedAt: (0, moment_1.default)().utc().valueOf()
            };
            let data = yield Models.textModel.updateOne(query, update);
            let response = {
                message: "Text updated successfully"
            };
            return response;
        }
        else {
            yield handler_1.default.handleCustomError(error_1.NotFound);
        }
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.fileLists = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { _id: userId } = req.userData;
        let { pagination, limit, documentId } = req.query;
        let query = {
            userId: new mongoose_1.Types.ObjectId(userId),
            type: text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE,
            documentId: documentId
        };
        let projection = { __v: 0 };
        // let option = { lean: true, sort: { _id: -1 } }
        let option = yield common_1.default.setOptions(pagination, limit);
        let fetchdata = yield Models.textModel.find(query, projection, option);
        let count = yield Models.textModel.countDocuments(query);
        let response = {
            count: count,
            data: fetchdata
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.textDetail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { _id } = req.userData;
        let { documentId } = req === null || req === void 0 ? void 0 : req.query;
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
        yield handler_1.default.handleCustomError(err);
    }
});
Service.deleteFile = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { docNo, documentId } = req.query;
        let { _id: userId } = req.userData;
        let query = { documentId: documentId, docNo: Number(docNo) };
        const result = yield neo4j_1.session.run(`
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
        yield handler_1.default.handleCustomError(err);
    }
});
Service.logout = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { accessToken } = req.userData;
        let query = { accessToken: accessToken };
        yield Models.sessionModel.deleteOne(query);
        let response = {
            message: "Logout Successfully"
        };
        return response;
    }
    catch (err) {
        // console.log("err-------", err)
        yield handler_1.default.handleCustomError(err);
    }
});
Service.updateFileText = (text, type, documentId, userId, fileName, docNo) => __awaiter(void 0, void 0, void 0, function* () {
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
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
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
        yield handler_1.default.handleCustomError(err);
    }
});
Service.textExtract = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { documentId } = req.body;
        let { originalname, buffer } = req === null || req === void 0 ? void 0 : req.file;
        let { _id: userId } = req.userData;
        let textData = yield _a.extract(originalname, buffer);
        let docId = uuidv4();
        let query = { userId: new mongoose_1.Types.ObjectId(userId), documentId: documentId };
        let projection = { __v: 0 };
        let option = { lean: true, sort: { _id: -1 } };
        let data;
        let fetchChatbot = yield Models.chatbotModel.findOne(query, projection, option);
        if (!fetchChatbot) {
            data = yield _a.embedText(textData, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE, userId, originalname, 1, docId);
            yield _a.createChatbot(data);
        }
        else {
            let fetchData = yield Models.textModel.findOne(query, projection, option);
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                docNo = docNo + 1;
                data = yield _a.updateFileText(textData, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE, documentId, userId, originalname, docNo);
            }
        }
        let response = {
            message: "File Added Successfully",
            data: data
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.extract = (originalname, buffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const extension = path_1.default.extname(originalname).toLowerCase();
        let text;
        const blob = new Blob([buffer]);
        switch (extension) {
            case ".pdf":
                text = yield _a.pdfLoad(blob);
                break;
            case ".txt":
                text = yield _a.textLoad(buffer);
                break;
            case ".csv":
                text = yield _a.csvLoad(blob);
                break;
            case ".docx":
                text = yield _a.docxLoad(blob);
                break;
            case ".doc":
                text = yield _a.docLoad(buffer);
                break;
            default: yield handler_1.default.handleCustomError(error_1.UnsupportedFileType);
        }
        let textData = text === null || text === void 0 ? void 0 : text.trim();
        return textData;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.pdfLoad = (blob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loader = new pdf_1.PDFLoader(blob);
        const docs = yield loader.load();
        const text = docs === null || docs === void 0 ? void 0 : docs.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.textLoad = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const text = buffer === null || buffer === void 0 ? void 0 : buffer.toString();
        return text;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.csvLoad = (blob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loader = new csv_1.CSVLoader(blob);
        const docs = yield loader.load();
        const text = docs === null || docs === void 0 ? void 0 : docs.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.docxLoad = (blob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loader = new docx_1.DocxLoader(blob);
        const docs = yield loader.load();
        const text = docs === null || docs === void 0 ? void 0 : docs.map(doc => doc.pageContent).join(' ');
        return text;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.docLoad = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const extractor = new word_extractor_1.default();
        const extracted = yield (extractor === null || extractor === void 0 ? void 0 : extractor.extract(buffer));
        const text = extracted === null || extracted === void 0 ? void 0 : extracted.getBody();
        return text;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.chatbotLists = (req) => __awaiter(void 0, void 0, void 0, function* () {
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
        // console.log("err---", err)
        yield handler_1.default.handleCustomError(err);
    }
});
Service.deleteChatbot = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { documentId } = req.query;
        let { _id: userId } = req.userData;
        const result = yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId})
                    DELETE n
                    `, { documentId: documentId });
        let query = {
            userId: userId,
            documentId: documentId
        };
        yield Models.textModel.deleteMany(query);
        yield Models.chatbotModel.deleteOne(query);
        let response = {
            message: "Chatbot Deleted Successfully"
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
// static url = async (req: any) => {
//     try {
//         let url = `https://www.zestgeek.com/about-us`;
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
Service.chatHistory = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f;
    try {
        let { documentId, pagination, limit } = req.query;
        let query = [
            yield chat_history_aggregation_1.default.matchData(documentId),
            yield chat_history_aggregation_1.default.lookupChatSessions(),
            yield chat_history_aggregation_1.default.unwindChatSessions(),
            yield chat_history_aggregation_1.default.lookupMessages(),
            yield chat_history_aggregation_1.default.groupData(),
            yield chat_history_aggregation_1.default.facetData(pagination, limit)
        ];
        let fetchData = yield Models.ipAddressModel.aggregate(query);
        let response = {
            count: (_d = (_c = (_b = fetchData[0]) === null || _b === void 0 ? void 0 : _b.count[0]) === null || _c === void 0 ? void 0 : _c.count) !== null && _d !== void 0 ? _d : 0,
            data: (_f = (_e = fetchData[0]) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : []
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.chatDetail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { sessionId, pagination, limit } = req.query;
        let query = { sessionId: new mongoose_1.Types.ObjectId(sessionId) };
        let projection = { __v: 0 };
        let options = yield common_1.default.setOptions(pagination, limit, { _id: 1 });
        let fetchData = yield Models.messageModel.find(query, projection, options);
        let count = yield Models.messageModel.countDocuments(query);
        let response = {
            count: count,
            data: fetchData
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
exports.default = Service;
