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
const neo4j_vector_1 = require("@langchain/community/vectorstores/neo4j_vector");
const openai_1 = require("@langchain/openai");
const openai_2 = require("openai");
const Models = __importStar(require("../../models/index"));
const dotenv_1 = require("dotenv");
const handler_1 = __importDefault(require("../../handler/handler"));
const error_1 = require("../../handler/error");
(0, dotenv_1.config)();
const axios_1 = __importDefault(require("axios"));
const { NEO_URL, OPEN_API_KEY, NEO_USERNAME, NEO_PASSWORD } = process.env;
const openai = new openai_1.OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY,
});
const open = new openai_2.OpenAI({
    apiKey: OPEN_API_KEY,
});
class SocketService {
}
_a = SocketService;
SocketService.getData = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        if (!token) {
            return { type: "error", data: error_1.ProvideToken };
        }
        let splitToken = token === null || token === void 0 ? void 0 : token.split(' ');
        if (splitToken[0] != 'Bearer') {
            return { type: "error", data: error_1.BearerToken };
        }
        const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${splitToken[1]}`;
        let response;
        try {
            response = yield axios_1.default.get(url);
            const tokenInfo = response === null || response === void 0 ? void 0 : response.data;
            let query = { email: (_b = tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.email) === null || _b === void 0 ? void 0 : _b.toLowerCase() };
            let projection = { __v: 0, createdAt: 0, updatedAt: 0 };
            let option = { lean: true };
            let data = yield Models.userModel.findOne(query, projection, option);
            return data;
        }
        catch (err) {
            yield Models.sessionModel.deleteOne({ socialToken: splitToken[1] });
            return { type: "error", data: error_1.InvalidToken };
        }
    }
    catch (err) {
        throw err;
    }
});
SocketService.searchInput = (search, chatId, documentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        // let dataToSave = {
        //     message: search,
        //     chatId: chatId,
        //     userId: userId,
        //     createdAt: moment().utc().valueOf(),
        // }
        // await Models.messageModel.create(dataToSave);
        const embeddingVector = yield openai.embedQuery(search);
        let config = {
            url: NEO_URL,
            username: NEO_USERNAME,
            password: NEO_PASSWORD
        };
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments([], openai, config); // Initialize the vector store
        // const searchResult = await vectorStore.similaritySearchVectorWithScore(embeddingVector, 6, search);
        // console.log("Search Result:", searchResult);
        // const query = `MATCH (n:Chunk { id: $id }) RETURN n`;
        // const params = { id: documentId?.toString() };
        // const data1 = await vectorStore.query(query, params);
        // console.log("data----", data1[0]?.n?.text)
        // // const filteredDocuments = records.map(record => record.get('n'));
        // console.log("")
        // let dbEmbed = data1[0]?.n?.embedding
        // const filter = { "documentId": { "$eq": documentId?.toString() } };
        // console.log("documentId----", documentId)
        const filter = { "documentId": { "$eq": documentId } };
        const searchResult = yield vectorStore.similaritySearchVectorWithScore(embeddingVector, 5, "", { filter, filterType: 'exact' });
        // console.log("searchResult----", searchResult);
        let contents = searchResult.map((result) => result[0].pageContent).join(" ");
        // console.log("contents----", contents)
        // const response = await open.chat.completions.create({
        //     model: 'gpt-3.5-turbo-1106',
        //     messages: [{ content: `${contents}\nQuery: ${search}\nAnswer:`, role: 'user' }],
        //     max_tokens: 150,
        //     stop: ['\n'],
        // });
        // console.log("response----", response)
        const response = yield open.chat.completions.create({
            model: 'gpt-3.5-turbo-1106', // Or another suitable model
            messages: [
                { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge.' },
                { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer based on context:` }
                // { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge.' },
                // { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer:` }
            ],
            max_tokens: 150,
            stop: ['\n'],
        });
        console.log("response----", response);
        // let data = {
        //     message: response.choices[0].message.content,
        //     chatId: chatId,
        //     // createdAt: moment().utc().valueOf(),
        // }
        // await Models.messageModel.create(data);
        console.log("response?.choices[0]?.message----", (_c = (_b = response === null || response === void 0 ? void 0 : response.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content);
        return (_e = (_d = response === null || response === void 0 ? void 0 : response.choices[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content;
    }
    catch (err) {
        throw yield handler_1.default.handleCustomError(err);
    }
});
exports.default = SocketService;
