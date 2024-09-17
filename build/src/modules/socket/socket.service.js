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
exports.updateChatSession = exports.formQues = exports.SocketRes = exports.saveMessage = exports.customMessage = exports.saveChatSession = exports.searchInput = void 0;
const neo4j_vector_1 = require("@langchain/community/vectorstores/neo4j_vector");
const openai_1 = require("@langchain/openai");
const openai_2 = require("openai");
const Models = __importStar(require("../../models/index"));
const Handler = __importStar(require("../../handler/handler"));
const moment_1 = __importDefault(require("moment"));
const dotenv_1 = require("dotenv");
const socket_1 = require("./socket");
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
const SocketRes = (message, sessionId, type, questionType, nextType, label) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = {
            message: message,
            sessionId: sessionId,
            type: type,
            questionType: questionType,
            nextType: nextType,
            label: label
        };
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.SocketRes = SocketRes;
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
exports.saveMessage = saveMessage;
const searchInput = (search, documentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // await saveMessage(search, documentId, ipAddressId, sessionId, Role.User); //save user search input message in db
        const embeddingVector = yield openai.embedQuery(search);
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments([], openai, neoConfig); // Initialize the vector store
        const filter = { "documentId": { "$eq": documentId } };
        const searchResult = yield vectorStore.similaritySearchVectorWithScore(embeddingVector, 5, "", { filter, filterType: 'exact' }); // search embeddings into vector db according to our input search embeddingVector and on exact filter documents.
        const contents = searchResult.map((result) => result[0].pageContent).join(" ");
        const response = yield open.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: [
                {
                    role: 'system',
                    //         content: `You are an assistant that responds based on the provided content. 
                    // - If the user greets you with phrases like "hello", "hi", "hey", or similar, respond with a simple greeting like "Hello!" and do not respond with the provided content.
                    // - If the user says something neutral or non-informative like "how are you" "okay", "thanks", "alright", respond with a polite acknowledgment such as "I am doing great, thanks for asking! How about you?" "Got it! If you need anything or have any questions, feel free to ask." or "You're welcome!" and do not reference the provided content.
                    // - If the user asks a question or makes a statement related to the provided content, respond based on the provided content.
                    // - Do not use any external knowledge.`
                    content: `You are an assistant that only answers based on the provided content. Do not use any external knowledge.
                        - If the user greets you with phrases like "hello", "hi", "hey", or similar, respond with a simple greeting like "Hello!" and do not respond with the provided content.`
                },
                { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer based on context:` }
            ],
            max_tokens: 150,
            stop: ['\n'],
        }); // answers the search questions based on the content that is provided to openai.
        const message = (_b = (_a = response === null || response === void 0 ? void 0 : response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content; // message that comes from openai response
        return message;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.searchInput = searchInput;
const saveChatSession = (ipAddressId, isFormCompleted) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataToSave = {
            ipAddressId: ipAddressId,
            isFormCompleted: isFormCompleted,
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
const customMessage = (question, nextType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message = "Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?";
        if (question == socket_1.questionType.HI && nextType == socket_1.questionType.NAME) {
            message = "what is your name?";
        }
        else if (question == socket_1.questionType.HI && nextType == socket_1.questionType.EMAIL) {
            message = "what is your email address?";
        }
        else if (question == socket_1.questionType.HI && nextType == socket_1.questionType.PHONE) {
            message = "what is your phone number?";
        }
        else if (question == socket_1.questionType.NAME && nextType == socket_1.questionType.END) {
            message = "Nice to meet you. Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?";
        }
        else if (question == socket_1.questionType.EMAIL && nextType == socket_1.questionType.END) {
            message = "Great. Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?";
        }
        else if (question == socket_1.questionType.PHONE && nextType == socket_1.questionType.END) {
            message = "Great. Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?";
        }
        else if (question == socket_1.questionType.NAME && nextType == socket_1.questionType.CUSTOM) {
            message = "Nice to meet you.";
        }
        else if (question == socket_1.questionType.EMAIL && nextType == socket_1.questionType.CUSTOM) {
            message = "Great, thanks.";
        }
        else if (question == socket_1.questionType.PHONE && nextType == socket_1.questionType.CUSTOM) {
            message = "Great, thanks.";
        }
        else if (question == socket_1.questionType.NAME && nextType == socket_1.questionType.EMAIL) {
            message = "Nice to meet you, what's your email address?";
        }
        else if (question == socket_1.questionType.NAME && nextType == socket_1.questionType.PHONE) {
            message = "Nice to meet you, what's your phone number?";
        }
        else if (question == socket_1.questionType.EMAIL && nextType == socket_1.questionType.PHONE) {
            message = "Great, thanks. what's your phone number?";
        }
        else if (question == socket_1.questionType.EMAIL && nextType == socket_1.questionType.NAME) {
            message = "Great, thanks. what's your name?";
        }
        else if (question == socket_1.questionType.PHONE && nextType == socket_1.questionType.NAME) {
            message = "Great, thanks. what's your name?";
        }
        else if (question == socket_1.questionType.PHONE && nextType == socket_1.questionType.EMAIL) {
            message = "Great, thanks. what's your email address?";
        }
        return message;
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.customMessage = customMessage;
const formQues = (documentId, label) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fetchData = yield Models.formModel.findOne({ documentId: documentId }, { __v: 0 }, { lean: true });
        if (fetchData) {
            const result = fetchData.fields.filter(field => field.label === label);
            const response = result[0].label;
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.formQues = formQues;
const updateChatSession = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = { _id: sessionId };
        const update = { isFormCompleted: true };
        const data = yield Models.chatSessionModel.findOneAndUpdate(query, update, { new: true });
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
exports.updateChatSession = updateChatSession;
