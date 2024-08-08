import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { OpenAI } from 'openai';
import * as Models from '../../models/index';
import * as Handler from "../../handler/handler";
import moment from "moment";
import { Role } from "../../models/message.model";
import { ErrorResponse } from "../../handler/error";
import { Types } from "mongoose";
import Message from "../../interfaces/message.interface";
import { NeoConfig } from "../../interfaces/common.interface";
import ChatSession from "../../interfaces/chat-session.interface";
import { config } from 'dotenv';
config();

const NEO_URL = process.env.NEO_URL as string;
const NEO_USERNAME = process.env.NEO_USERNAME as string;
const NEO_PASSWORD = process.env.NEO_PASSWORD as string;
const OPEN_API_KEY = process.env.OPEN_API_KEY as string;

const neoConfig: NeoConfig = {
    url: NEO_URL,
    username: NEO_USERNAME,
    password: NEO_PASSWORD
};

const openai = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY,
});
const open = new OpenAI({
    apiKey: OPEN_API_KEY,
})

const saveMessage = async (message: string | null, documentId: string, ipAddressId: Types.ObjectId, sessionId: Types.ObjectId, messageType: string) => {
    try {
        const dataToSave: Message = {
            message,
            ipAddressId,
            sessionId,
            documentId,
            messageType,
            createdAt: moment().utc().valueOf(),
        }
        await Models.messageModel.create(dataToSave);
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const searchInput = async (search: string, documentId: string, ipAddressId: Types.ObjectId, sessionId: Types.ObjectId): Promise<string | null> => {
    try {
        await saveMessage(search, documentId, ipAddressId, sessionId, Role.User); //save user search input message in db
        const embeddingVector = await openai.embedQuery(search);
        const vectorStore = await Neo4jVectorStore.fromDocuments([], openai, neoConfig); // Initialize the vector store
        const filter = { "documentId": { "$eq": documentId } };
        const searchResult = await vectorStore.similaritySearchVectorWithScore(embeddingVector, 5, "", { filter, filterType: 'exact' }); // search embeddings into vector db according to our input search embeddingVector and on exact filter documents.
        const contents = searchResult.map((result: [Document, number]) => result[0].pageContent).join(" ");
        const response = await open.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: [
                { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge.' },
                { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer based on context:` }
            ],
            max_tokens: 150,
            stop: ['\n'],
        }); // answers the search questions based on the content that is provided to openai.
        const message = response?.choices[0]?.message?.content  // message that comes from openai response
        await saveMessage(message, documentId, ipAddressId, sessionId, Role.AI); //save openai message in db
        return message;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const saveChatSession = async (ipAddressId: Types.ObjectId): Promise<ChatSession> => {
    try {
        const dataToSave: ChatSession = {
            ipAddressId: ipAddressId,
            createdAt: moment().utc().valueOf()
        }
        const response = await Models.chatSessionModel.create(dataToSave);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

export {
    searchInput,
    saveChatSession
}