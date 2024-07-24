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
const { OPEN_API_KEY, NEO_URL, NEO_USERNAME, NEO_PASSWORD } = process.env;
const documents_1 = require("@langchain/core/documents");
const { v4: uuidv4 } = require('uuid');
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const csv_1 = require("@langchain/community/document_loaders/fs/csv");
const docx_1 = require("@langchain/community/document_loaders/fs/docx");
const path_1 = __importDefault(require("path"));
const word_extractor_1 = __importDefault(require("word-extractor"));
const openai = new openai_1.OpenAIEmbeddings({
    model: "text-embedding-3-large",
    // model: "text-embedding-ada-002",
    batchSize: 512, // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
    apiKey: OPEN_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
});
const textsplitters_1 = require("@langchain/textsplitters");
const text_model_1 = require("../../models/text.model");
let neoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};
// let url = "neo4j+s://b641f24a.databases.neo4j.io"
// let username = "neo4j"
// let password = "8n2HGgKPToBlAoVr1GlTD2ry4Ue9yH3kCH60fUgeO20"
// const graph = Neo4jGraph.initialize({ url, username, password });
// const model = new ChatOpenAI({
//     temperature: 0,
//     model: "gpt-3.5-turbo-1106",
//     apiKey: OPEN_API_KEY
// });
// const llmGraphTransformer = new LLMGraphTransformer({
//     llm: model,
// });
class Service {
}
_a = Service;
Service.login = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, name, image, socialToken, isAdmin } = req.body;
        console.log("req.body;---", req.body);
        let query = { email: email.toLowerCase() };
        let projection = { __v: 0 };
        let option = { lean: true };
        let fetchData = yield Models.userModel.findOne(query, projection, option);
        console.log("fetchData--", fetchData);
        if (fetchData) {
            console.log("if---");
            let { _id } = fetchData;
            let session = yield _a.createSession(_id, socialToken);
            fetchData.socialToken = session === null || session === void 0 ? void 0 : session.socialToken;
            console.log("fetchData---", fetchData);
            return fetchData;
        }
        let dataToSave = {
            email: email.toLowerCase(),
            name: name,
            image: image,
            isAdmin: isAdmin,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let userData = yield Models.userModel.create(dataToSave);
        let session = yield _a.createSession(userData === null || userData === void 0 ? void 0 : userData._id, socialToken);
        userData._doc['socialToken'] = session === null || session === void 0 ? void 0 : session.socialToken;
        console.log("userData----", userData);
        return userData;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.createSession = (user_id, socialToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let dataToSession = {
            userId: user_id,
            socialToken: socialToken,
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
        const { text } = req.body;
        let { _id } = req.userData;
        let query = { userId: new mongoose_1.Types.ObjectId(_id) };
        let projection = { __v: 0 };
        let option = { lean: true, sort: { _id: -1 } };
        let fetchData = yield Models.textModel.findOne(query, projection, option);
        console.log("fetchData-----", fetchData);
        let num = 1;
        let docId = uuidv4();
        if (fetchData) {
            let { docNo, documentId } = fetchData;
            console.log("docNo--save texts before----", docNo);
            docNo = docNo + 1;
            console.log("docNo--save texts after----", docNo);
            num = docNo;
            docId = documentId;
        }
        console.log("number--------", num);
        console.log("docId---", docId);
        let data = yield _a.embedText(text, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.TEXT, _id, null, num, docId);
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
Service.embedText = (text, type, userId, fileName, docNo, docId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
        const docOutput = yield textSplitter.splitDocuments([
            new documents_1.Document({ pageContent: text, metadata: { documentId: docId === null || docId === void 0 ? void 0 : docId.toString(), docNo: docNo } }), // Ensure id is converted to string
        ]);
        docOutput.forEach(doc => {
            if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                doc.metadata.loc = doc.metadata.loc.toString(); // Convert object to string representation
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
// static saveTexts = async (req: any) => {
//     try {
//         const { text } = req.body;
//         const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
//         const documentId = uuidv4();
//         const docOutput = await textSplitter.splitDocuments([
//             new Document({ pageContent: text, metadata: { documentId: documentId?.toString() } }), // Ensure id is converted to string
//         ]);
//         docOutput.forEach(doc => {
//             if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
//                 doc.metadata.loc = doc.metadata.loc.toString(); // Convert object to string representation
//             }
//         });
//         const vectorStore = await Neo4jVectorStore.fromDocuments(
//             docOutput,
//             openai,
//             neoConfig
//         );
//         let { _id } = req.userData
//         let dataToSave = {
//             text: text,
//             userId: _id,
//             documentId: documentId,
//             createdAt: moment().utc().valueOf()
//         }
//         let saveData = await Models.textModel.create(dataToSave)
//         let response = {
//             messgage: "Text Added successfully",
//             data: saveData
//         }
//         return response;
//     }
//     catch (err) {
//         await Handler.handleCustomError(err);
//     }
// }
Service.embeddings = (text) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const segments = (_b = text === null || text === void 0 ? void 0 : text.split('.')) === null || _b === void 0 ? void 0 : _b.map((sentence) => sentence.trim());
        const segmentDocuments = segments === null || segments === void 0 ? void 0 : segments.map((segment) => new documents_1.Document({ pageContent: segment }));
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(
        // [new Document({ pageContent: text })],
        segmentDocuments, openai, neoConfig);
        return {
            message: "Embeddings created successfully"
        };
    }
    catch (err) {
        throw yield handler_1.default.handleCustomError(err);
    }
});
Service.updateTexts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, text } = req.body;
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
        // console.log("req.query----", req.query)
        let { pagination, limit } = req.query;
        let query = { type: text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE };
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
        let { _id } = req.params;
        let query = { userId: new mongoose_1.Types.ObjectId(_id), type: text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.TEXT };
        let projection = { __v: 0 };
        let options = { lean: true, sort: { _id: -1 } };
        let response = yield Models.textModel.findOne(query, projection, options);
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.deleteFile = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let { _id } = req.params;
        let { docNo, documentId } = req.query;
        // console.log("req.query----", req.query)
        let query = { documentId: documentId, docNo: Number(docNo) };
        // let projection = { __v: 0 };
        // let option = { lean: true }
        // let fetchData = await Models.textModel.findOne(query, projection, option);
        // console.log("fetchData-----", fetchData)
        // if (!fetchData) await Handler.handleCustomError(NotFound);
        // console.log("documentId---", documentId)
        // if (!documentId) await Handler.handleCustomError(ProvideDocumentId);
        const result = yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `, { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString(), docNo: Number(docNo) });
        console.log("result----", result);
        // let query = { documentId: new Types.ObjectId(documentId) }
        yield Models.textModel.deleteOne(query);
        let response = {
            message: "Deleted Successfully"
        };
        console.log("response", response);
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.logout = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { socialToken } = req.userData;
        let query = { socialToken: socialToken };
        yield Models.sessionModel.deleteOne(query);
        let response = {
            message: "Logout Successfully"
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.updateFileText = (text, type, documentId, userId, fileName, docNo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
        const docOutput = yield textSplitter.splitDocuments([
            new documents_1.Document({ pageContent: text, metadata: { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString(), docNo: docNo } }), // Ensure id is converted to string
        ]);
        docOutput.forEach(doc => {
            if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                doc.metadata.loc = doc.metadata.loc.toString(); // Convert object to string representation
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
        console.log("req-----", req === null || req === void 0 ? void 0 : req.file);
        let { originalname, buffer } = req === null || req === void 0 ? void 0 : req.file;
        let { _id: userId } = req.userData;
        const extension = path_1.default.extname(originalname).toLowerCase();
        console.log("extension---", extension);
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
        console.log("text---", text);
        let textData = text === null || text === void 0 ? void 0 : text.trim();
        let query = { userId: new mongoose_1.Types.ObjectId(userId) };
        let projection = { __v: 0 };
        let option = { lean: true, sort: { _id: -1 } };
        let fetchData = yield Models.textModel.findOne(query, projection, option);
        console.log("fetchData-----", fetchData);
        let data;
        if (fetchData) {
            let { documentId, docNo } = fetchData;
            console.log("docNo-- before----", docNo);
            docNo = docNo + 1;
            console.log("docNo-- after----", docNo);
            data = yield _a.updateFileText(textData, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE, documentId, userId, originalname, docNo);
        }
        else {
            let docId = uuidv4();
            data = yield _a.embedText(textData, text_model_1.type === null || text_model_1.type === void 0 ? void 0 : text_model_1.type.FILE, userId, originalname, 1, docId);
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
exports.default = Service;
