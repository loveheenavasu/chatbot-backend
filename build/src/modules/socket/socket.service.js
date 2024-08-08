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
exports.saveChatSession = exports.searchInput = void 0;
const neo4j_vector_1 = require("@langchain/community/vectorstores/neo4j_vector");
const openai_1 = require("@langchain/openai");
const openai_2 = require("openai");
const Models = __importStar(require("../../models/index"));
const Handler = __importStar(require("../../handler/handler"));
const moment_1 = __importDefault(require("moment"));
const message_model_1 = require("../../models/message.model");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const NEO_URL = process.env.NEO_URL;
const NEO_USERNAME = process.env.NEO_USERNAME;
const NEO_PASSWORD = process.env.NEO_PASSWORD;
const OPEN_API_KEY = process.env.OPEN_API_KEY;
const neoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};
const openai = new openai_1.OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY,
});
const open = new openai_2.OpenAI({
    apiKey: OPEN_API_KEY,
});
const saveMessage = (message, documentId, ipAddressId, sessionId, messageType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataToSave = {
            message,
            ipAddressId,
            sessionId,
            documentId,
            messageType,
            createdAt: (0, moment_1.default)().utc().valueOf(),
        };
        yield Models.messageModel.create(dataToSave);
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
const searchInput = (search, documentId, ipAddressId, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        yield saveMessage(search, documentId, ipAddressId, sessionId, message_model_1.Role.User); //save user search input message in db
        const embeddingVector = yield openai.embedQuery(search);
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments([], openai, neoConfig); // Initialize the vector store
        const filter = { "documentId": { "$eq": documentId } };
        const searchResult = yield vectorStore.similaritySearchVectorWithScore(embeddingVector, 5, "", { filter, filterType: 'exact' }); // search embeddings into vector db according to our input search embeddingVector and on exact filter documents.
        const contents = searchResult.map((result) => result[0].pageContent).join(" ");
        const response = yield open.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: [
                { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge.' },
                { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer based on context:` }
            ],
            max_tokens: 150,
            stop: ['\n'],
        }); // answers the search questions based on the content that is provided to openai.
        const message = (_b = (_a = response === null || response === void 0 ? void 0 : response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content; // message that comes from openai response
        yield saveMessage(message, documentId, ipAddressId, sessionId, message_model_1.Role.AI); //save openai message in db
        return message;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.searchInput = searchInput;
const saveChatSession = (ipAddressId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataToSave = {
            ipAddressId: ipAddressId,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        const response = yield Models.chatSessionModel.create(dataToSave);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.saveChatSession = saveChatSession;
