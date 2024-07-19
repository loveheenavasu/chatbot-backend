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
const openai = new openai_1.OpenAIEmbeddings({
    model: "text-embedding-3-large",
    // model: "text-embedding-ada-002",
    batchSize: 512, // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
    apiKey: OPEN_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
});
const openai_2 = require("openai");
const textsplitters_1 = require("@langchain/textsplitters");
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
// static embeddingsCreate = async (req: any) => {
//     try {
//         console.log("embedding-- create-")
//         let { text } = req.body
//         const embedding = await openai.embedQuery(text)
//         // const document = new Document({ pageContent: text, embedding: embedding });
//         // const result = await llmGraphTransformer.convertToGraphDocuments([document]);
//                 const result = await llmGraphTransformer.convertToGraphDocuments([
//                     new Document({ pageContent: text })
//                 ]);
//                 console.log("result--", result)
//                 console.log(`Nodes: ${result[0].nodes.length}`);
//                 console.log(`Relationships:${result[0].relationships.length}`);
//         let response = await (await graph).addGraphDocuments(result)
//         // console.log("response----",response)
//         return embedding
//     }
//     catch (err) {
//         console.log("error----", err)
//         throw await Handler.handleCustomError(err);
//     }
// }
// static embeddingsCreate = async (req: any) => {
//     try {
//         console.log("embedding-- create-")
//         let { text } = req.body
//         // const embedding = await openai.embedQuery(text)
//         // const text = "Mitochondria is the powerhouse of the cell. Buildings are made of brick.";
//         const segments = text.split('. ').map((sentence: any) => sentence.trim() + '.');
//         console.log("segments---", segments)
//         const segmentDocuments = segments.map((segment: any) => new Document({ pageContent: segment }));
//         console.log("segmentDocuments---", segmentDocuments)
//         let config = {
//             url: url,
//             username: username,
//             password: password
//         }
//         const vectorStore1 = await Neo4jVectorStore.fromDocuments(
//             segmentDocuments,
//             openai,
//             config
//         );
//         // console.log("vectorStore---", vectorStore)
//         // let d =await vectorStore.similaritySearch("What is the powerhouse of the cell?", 1)
//         //     const result: any = await session.run(
//         //         `
//         //  CREATE (e:curie {text:$text, embedding: $embedding})
//         //       RETURN e
//         //       `,
//         //         {text:text, embedding: embedding }
//         //     )
//         //     console.log("result----", result)
//         //     console.log("result?.records[0]?._fields", result?.records[0]?._fields);
//         //     console.log("result?.records[0]?.keys---", result?.records[0]?.keys);
//         return "embedding"
//     }
//     catch (err) {
//         console.log("error----", err)
//         throw await Handler.handleCustomError(err);
//     }
// }
Service.embeddingsCreate = (text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let { text } = req.body;
        const documentId = uuidv4();
        console.log("documentId---", documentId);
        // const segments = text?.split('.')?.map((sentence: any) => sentence.trim());
        // const segmentDocuments = segments?.map((segment: any) => new Document({ pageContent: segment }));
        // const segmentDocuments = await segments?.map((segment: string) => ({
        //     pageContent: segment,
        //     metadata: { id: documentId }
        // }));
        // console.log("segmentDocuments---", segmentDocuments)
        // let config: any = {
        //     url: NEO_URL,
        //     username: NEO_USERNAME,
        //     password: NEO_PASSWORD
        // };
        // console.log("config----", neoConfig)
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments([new documents_1.Document({ pageContent: text, metadata: { id: documentId } })], 
        // segmentDocuments,
        openai, neoConfig);
        let response = {
            message: "Embeddings created successfully",
            documentId: documentId
        };
        return response;
    }
    catch (err) {
        console.log("error----", err);
        throw yield handler_1.default.handleCustomError(err);
    }
});
Service.searchInput = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { search, id } = req.query;
        const embeddingVector = yield openai.embedQuery(search);
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments([], openai, neoConfig);
        const filter = { "id": { "$eq": id === null || id === void 0 ? void 0 : id.toString() } };
        const searchResult = yield vectorStore.similaritySearchVectorWithScore(embeddingVector, 2, search, { filter, filterType: 'exact' });
        console.log("searchResult----", searchResult);
        let contents = searchResult.map((result) => result[0].pageContent).join(" ");
        const open = new openai_2.OpenAI({
            apiKey: OPEN_API_KEY,
        });
        // const response = await open.chat.completions.create({
        //     model: 'gpt-3.5-turbo-1106', // Or another suitable model
        //     messages: [{ content: `${contents}\nQuery: ${search}\nAnswer:`, role: 'user' }],
        //     max_tokens: 150,
        //     stop: ['\n'],
        // });
        // { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge. If the answer is not in the content, state "The provided content does not contain information about this query."' },
        console.log("contents----", contents);
        const response = yield open.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: [
                { role: 'system', content: 'You only know what is contained in the provided content. Do not use any outside knowledge.' },
                { role: 'user', content: `Content: ${contents}\n\nQuery: ${search}\n\nAnswer:` }
            ],
            max_tokens: 150,
            stop: ['\n'],
        });
        console.log("response----", response);
        return response.choices[0].message.content;
    }
    catch (err) {
        console.log("error----", err);
        throw yield handler_1.default.handleCustomError(err);
    }
});
Service.saveTexts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
        const documentId = uuidv4();
        console.log("documentId---", documentId);
        const docOutput = yield textSplitter.splitDocuments([
            new documents_1.Document({ pageContent: text, metadata: { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString() } }), // Ensure id is converted to string
        ]);
        console.log("docOutput----", docOutput);
        // let config = {
        //     url: url,
        //     username: username,
        //     password: password
        // };
        docOutput.forEach(doc => {
            if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                // delete doc?.metadata?.loc
                doc.metadata.loc = doc.metadata.loc.toString(); // Convert object to string representation
            }
        });
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(
        // [new Document({ pageContent: text, metadata: { id: documentId } })],
        // segmentDocuments,
        docOutput, openai, neoConfig);
        console.log("vectorStore----", vectorStore);
        // let embeddingData = await this.embeddingsCreate(text)
        let { _id } = req.userData;
        console.log("req.userData----", req.userData);
        console.log("message----", text);
        let dataToSave = {
            text: text,
            userId: _id,
            documentId: documentId,
            createdAt: (0, moment_1.default)().utc().valueOf()
        };
        let saveData = yield Models.textModel.create(dataToSave);
        // // await this.embeddings(text)
        let response = {
            messgage: "Text Added successfully",
            data: saveData
        };
        return response;
    }
    catch (err) {
        console.log("error---", err);
        // await Handler.handleCustomError(err);
        throw err;
    }
});
// static saveTexts = async (req: any) => {
//     try {
//         const { text } = req.body;
//         let embeddingData = await this.embeddingsCreate(text)
//         let { _id } = req.userData
//         console.log("req.userData----", req.userData)
//         console.log("message----", text)
//         let dataToSave = {
//             text: text,
//             userId: _id,
//             documentId: embeddingData?.documentId,
//             createdAt: moment().utc().valueOf()
//         }
//         let saveData = await Models.textModel.create(dataToSave)
//         // await this.embeddings(text)
//         console.log("saveData---", saveData)
//         let response = {
//             messgage: "Text Added successfully",
//             data: saveData
//         }
//         return response;
//     }
//     catch (err) {
//         console.log("error---", err)
//         // await Handler.handleCustomError(err);
//         throw err;
//     }
// }
Service.embeddings = (text) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        // let { text } = req.body;
        const segments = (_b = text === null || text === void 0 ? void 0 : text.split('.')) === null || _b === void 0 ? void 0 : _b.map((sentence) => sentence.trim());
        const segmentDocuments = segments === null || segments === void 0 ? void 0 : segments.map((segment) => new documents_1.Document({ pageContent: segment }));
        // console.log("segmentDocuments---", segmentDocuments)
        // let config = {
        //     url: url,
        //     username: username,
        //     password: password
        // };
        const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(
        // [new Document({ pageContent: text })],
        segmentDocuments, openai, neoConfig);
        return {
            message: "Embeddings created successfully"
        };
    }
    catch (err) {
        console.log("error----", err);
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
        console.log("fetchData---", fetchData);
        if (fetchData) {
            console.log("fetchData---", fetchData);
            let { documentId } = fetchData;
            const result = yield neo4j_1.session.run(`
                    MATCH (n:Chunk {documentId: $documentId})
                    DELETE n
                    `, { documentId: documentId });
            const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
            console.log("documentId---", documentId);
            const docOutput = yield textSplitter.splitDocuments([
                new documents_1.Document({ pageContent: text, metadata: { documentId: documentId === null || documentId === void 0 ? void 0 : documentId.toString() } }), // Ensure id is converted to string
            ]);
            console.log("docOutput----", docOutput);
            // let config = {
            //     url: url,
            //     username: username,
            //     password: password
            // };
            docOutput.forEach(doc => {
                if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                    // delete doc?.metadata?.loc
                    doc.metadata.loc = doc.metadata.loc.toString(); // Convert object to string representation
                }
            });
            const vectorStore = yield neo4j_vector_1.Neo4jVectorStore.fromDocuments(docOutput, openai, neoConfig);
            let update = {
                text: text,
                updatedAt: (0, moment_1.default)().utc().valueOf()
            };
            let data = yield Models.textModel.updateOne(query, update);
            let response = {
                message: "Text updated successfully",
                // data: data
            };
            return response;
        }
        else {
            yield handler_1.default.handleCustomError(error_1.NotFound);
        }
        // const result: any = await session.run(` MATCH (e) DELETE e`)
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
// static updateTexts = async (req: any) => {
//     try {
//         const { _id, text } = req.body;
//         let query = { _id: new Types.ObjectId(_id) }
//         let projection = { __v: 0 }
//         let options = { lean: true }
//         let fetchData = await Models.textModel.findOne(query, projection, options)
//         if (fetchData) {
//             console.log("fetchData---", fetchData)
//             const embedding = await openai.embedQuery(text)
//             const result: any = await session.run(
//                 `
//                 MATCH (n:Chunk {id: $id})
//                 SET n.embedding = $embedding, n.text = $text
//                 RETURN n
//                 `,
//                 { id: fetchData?.documentId, embedding: embedding, text: text }
//             );
//             console.log("result --- ", result)
//             // await this.embeddings(text);
//             // await this.embeddingsCreate(text);
//             let update = {
//                 text: text,
//                 updatedAt: moment().utc().valueOf()
//             }
//             let data = await Models.textModel.updateOne(query, update);
//             let response = {
//                 message: "Text updated successfully",
//                 data: data
//             }
//             return response;
//         }
//         else {
//             await Handler.handleCustomError(NotFound)
//         }
//         // const result: any = await session.run(` MATCH (e) DELETE e`)
//     }
//     catch (err) {
//         await Handler.handleCustomError(err);
//     }
// }
Service.textLists = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("req.query----", req.query);
        let { pagination, limit } = req.query;
        let query = {};
        let projection = { __v: 0 };
        let option = { lean: true, sort: { _id: -1 } };
        // console.log("pagination---", pagination);
        // console.log("liit----",limit)
        // let option = await CommonHelper.setOptions(pagination, limit);
        let fetchdata = yield Models.textModel.findOne(query, projection, option);
        // let count = await Models.textModel.countDocuments(query);
        // let response = {
        //     count: count,
        //     data: fetchdata
        // }
        return fetchdata;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.textDetail = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { _id } = req.params;
        let query = { userId: new mongoose_1.Types.ObjectId(_id) };
        let projection = { __v: 0 };
        let options = { lean: true, sort: { _id: -1 } };
        let response = yield Models.textModel.findOne(query, projection, options);
        console.log("response----", response);
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.textDelete = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { _id } = req.params;
        let query = { _id: new mongoose_1.Types.ObjectId(_id) };
        yield Models.textModel.deleteOne(query);
        let response = {
            message: "Deleted Successfully"
        };
        return response;
    }
    catch (err) {
        yield handler_1.default.handleCustomError(err);
    }
});
Service.chatList = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { chatId, pagination, limit } = req.query;
        console.log("req.query----", req.query);
        console.log("req.userData----", req.userData);
        let { _id } = req.userData;
        let query = { chatId: chatId };
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
exports.default = Service;
