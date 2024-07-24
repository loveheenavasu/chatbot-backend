import express from 'express';
import * as Models from '../../models/index';
import moment from 'moment';
import { Types } from 'mongoose';
import Handler from '../../handler/handler';
import { NotFound, ProvideDocumentId, UnsupportedFileType } from '../../handler/error';
import CommonHelper from '../../common/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from 'dotenv';
import { session } from '../../config/neo4j';
config();
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
const { OPEN_API_KEY, NEO_URL, NEO_USERNAME, NEO_PASSWORD } = process.env;
import { Document } from "@langchain/core/documents";
import fs from 'fs';
const { v4: uuidv4 } = require('uuid');
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import path from 'path';
import WordExtractor from 'word-extractor';

const openai = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    // model: "text-embedding-ada-002",
    batchSize: 512,// Defaults to "gpt-3.5-turbo-instruct" if no model provided.
    apiKey: OPEN_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
});
import { OpenAI } from 'openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { type } from '../../models/text.model';
import axios from 'axios';

let neoConfig: any = {
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



export default class Service {

    static login = async (req: express.Request | any) => {
        try {
            let { email, name, image, socialToken, isAdmin } = req.body;
            console.log("req.body;---", req.body)
            let query = { email: email.toLowerCase() }
            let projection = { __v: 0 }
            let option = { lean: true }
            let fetchData: any = await Models.userModel.findOne(query, projection, option);
            console.log("fetchData--", fetchData)
            if (fetchData) {
                console.log("if---")
                let { _id } = fetchData
                let session = await this.createSession(_id, socialToken)
                fetchData.socialToken = session?.socialToken;
                console.log("fetchData---", fetchData)
                return fetchData;
            }
            let dataToSave = {
                email: email.toLowerCase(),
                name: name,
                image: image,
                isAdmin: isAdmin,
                createdAt: moment().utc().valueOf()
            }

            let userData: any = await Models.userModel.create(dataToSave);
            let session = await this.createSession(userData?._id, socialToken)
            userData._doc['socialToken'] = session?.socialToken;
            console.log("userData----", userData)
            return userData;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static createSession = async (user_id: Types.ObjectId, socialToken: string) => {
        try {
            let dataToSession = {
                userId: user_id,
                socialToken: socialToken,
                createdAt: moment().utc().valueOf()
            }
            let response = await Models.sessionModel.create(dataToSession);
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static saveTexts = async (req: any) => {
        try {
            const { text } = req.body;
            let { _id } = req.userData;
            let query = { userId: new Types.ObjectId(_id) }
            let projection = { __v: 0 }
            let option = { lean: true, sort: { _id: -1 } }
            let fetchData = await Models.textModel.findOne(query, projection, option);
            console.log("fetchData-----", fetchData)
            let num = 1;
            let docId = uuidv4();
            if (fetchData) {
                let { docNo, documentId } = fetchData;
                console.log("docNo--save texts before----", docNo)
                docNo = docNo + 1;
                console.log("docNo--save texts after----", docNo)
                num = docNo;
                docId = documentId
            }
            console.log("number--------", num)
            console.log("docId---", docId)
            let data = await this.embedText(text, type?.TEXT, _id, null, num, docId);
            let response = {
                messgage: "Text Added Successfully",
                data: data
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static embedText = async (text: any, type: string, userId: any, fileName?: any, docNo?: any, docId?: any) => {
        try {
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });

            const docOutput = await textSplitter.splitDocuments([
                new Document({ pageContent: text, metadata: { documentId: docId?.toString(), docNo: docNo } }), // Ensure id is converted to string
            ]);
            docOutput.forEach(doc => {
                if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                    doc.metadata.loc = doc.metadata.loc.toString(); // Convert object to string representation
                }
            });
            const vectorStore = await Neo4jVectorStore.fromDocuments(
                docOutput,
                openai,
                neoConfig
            );

            let dataToSave = {
                text: text,
                userId: userId,
                type: type,
                fileName: fileName,
                documentId: docId,
                docNo: docNo,
                createdAt: moment().utc().valueOf()
            }
            let saveData = await Models.textModel.create(dataToSave);
            return saveData;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

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

    static embeddings = async (text: string) => {
        try {
            const segments = text?.split('.')?.map((sentence: any) => sentence.trim());
            const segmentDocuments = segments?.map((segment: any) => new Document({ pageContent: segment }));
            const vectorStore = await Neo4jVectorStore.fromDocuments(
                // [new Document({ pageContent: text })],
                segmentDocuments,
                openai,
                neoConfig
            );

            return {
                message: "Embeddings created successfully"
            };
        }
        catch (err) {
            throw await Handler.handleCustomError(err);
        }
    }

    static updateTexts = async (req: any) => {
        try {
            const { _id, text } = req.body;
            let query = { _id: new Types.ObjectId(_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let fetchData = await Models.textModel.findOne(query, projection, options)
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                const result: any = await session.run(
                    `
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `,
                    { documentId: documentId, docNo: docNo }
                );
                const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
                const docOutput = await textSplitter.splitDocuments([
                    new Document({ pageContent: text, metadata: { documentId: documentId?.toString(), docNo: docNo } }), // Ensure id is converted to string
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
                let update = {
                    text: text,
                    docNo: docNo,
                    updatedAt: moment().utc().valueOf()
                }
                let data = await Models.textModel.updateOne(query, update);
                let response = {
                    message: "Text updated successfully"
                }
                return response;
            }
            else {
                await Handler.handleCustomError(NotFound)
            }
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static fileLists = async (req: any) => {
        try {
            // console.log("req.query----", req.query)
            let { _id: userId } = req.userData;
            let { pagination, limit } = req.query;
            let query = { userId: new Types.ObjectId(userId), type: type?.FILE }
            let projection = { __v: 0 }
            // let option = { lean: true, sort: { _id: -1 } }
            let option = await CommonHelper.setOptions(pagination, limit);
            let fetchdata = await Models.textModel.find(query, projection, option);
            let count = await Models.textModel.countDocuments(query);
            let response = {
                count: count,
                data: fetchdata
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static textDetail = async (req: any) => {
        try {
            let { _id } = req.params;
            let query = { userId: new Types.ObjectId(_id), type: type?.TEXT }
            let projection = { __v: 0 }
            let options = { lean: true, sort: { _id: -1 } }
            let response = await Models.textModel.findOne(query, projection, options);
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static deleteFile = async (req: any) => {
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
            const result: any = await session.run(
                `
                    MATCH (n:Chunk {documentId: $documentId, docNo: $docNo})
                    DELETE n
                    `,
                { documentId: documentId?.toString(), docNo: Number(docNo) }
            );
            console.log("result----", result)
            // let query = { documentId: new Types.ObjectId(documentId) }
            await Models.textModel.deleteOne(query);
            let response = {
                message: "Deleted Successfully"
            }
            console.log("response", response)
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static logout = async (req: any) => {
        try {
            let { socialToken } = req.userData
            let query = { socialToken: socialToken }
            await Models.sessionModel.deleteOne(query);
            let response = {
                message: "Logout Successfully"
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static updateFileText = async (text: any, type: string, documentId: any, userId: any, fileName: string, docNo: any) => {
        try {
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 1 });
            const docOutput = await textSplitter.splitDocuments([
                new Document({ pageContent: text, metadata: { documentId: documentId?.toString(), docNo: docNo } }), // Ensure id is converted to string
            ]);
            docOutput.forEach(doc => {
                if (doc.metadata.loc && typeof doc.metadata.loc === 'object') {
                    doc.metadata.loc = doc.metadata.loc.toString(); // Convert object to string representation
                }
            });
            const vectorStore = await Neo4jVectorStore.fromDocuments(
                docOutput,
                openai,
                neoConfig
            );

            let dataToSave = {
                text: text,
                userId: userId,
                type: type,
                fileName: fileName,
                documentId: documentId,
                docNo: docNo,
                createdAt: moment().utc().valueOf()
            }
            let saveData = await Models.textModel.create(dataToSave);
            return saveData;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static textExtract = async (req: any) => {
        try {
            console.log("req-----", req?.file)
            let { originalname, buffer } = req?.file
            let { _id: userId } = req.userData;
            const extension = path.extname(originalname).toLowerCase();
            console.log("extension---", extension)
            let text: any;
            const blob = new Blob([buffer]);
            switch (extension) {
                case ".pdf":
                    text = await this.pdfLoad(blob);
                    break;
                case ".txt":
                    text = await this.textLoad(buffer);
                    break;
                case ".csv":
                    text = await this.csvLoad(blob);
                    break;
                case ".docx":
                    text = await this.docxLoad(blob);
                    break;
                case ".doc":
                    text = await this.docLoad(buffer);
                    break;
                default: await Handler.handleCustomError(UnsupportedFileType);
            }
            console.log("text---", text);
            let textData = text?.trim()
            let query = { userId: new Types.ObjectId(userId) }
            let projection = { __v: 0 }
            let option = { lean: true, sort: { _id: -1 } }
            let fetchData = await Models.textModel.findOne(query, projection, option);
            console.log("fetchData-----", fetchData)
            let data: any;
            if (fetchData) {
                let { documentId, docNo } = fetchData;
                console.log("docNo-- before----", docNo)
                docNo = docNo + 1;
                console.log("docNo-- after----", docNo)
                data = await this.updateFileText(textData, type?.FILE, documentId, userId, originalname, docNo)
            }
            else {
                let docId = uuidv4();
                data = await this.embedText(textData, type?.FILE, userId, originalname, 1, docId);
            }


            let response = {
                message: "File Added Successfully",
                data: data
            }
            return response;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static pdfLoad = async (blob: any) => {
        try {
            const loader = new PDFLoader(blob);
            const docs = await loader.load();
            const text = docs?.map(doc => doc.pageContent).join(' ');
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static textLoad = async (buffer: any) => {
        try {
            const text = buffer?.toString();
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static csvLoad = async (blob: any) => {
        try {
            const loader = new CSVLoader(blob);
            const docs = await loader.load();
            const text = docs?.map(doc => doc.pageContent).join(' ');
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static docxLoad = async (blob: any) => {
        try {
            const loader = new DocxLoader(blob);
            const docs = await loader.load();
            const text = docs?.map(doc => doc.pageContent).join(' ');
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }

    static docLoad = async (buffer: any) => {
        try {
            const extractor = new WordExtractor();
            const extracted = await extractor?.extract(buffer);
            const text = extracted?.getBody();
            return text;
        }
        catch (err) {
            await Handler.handleCustomError(err);
        }
    }









}



