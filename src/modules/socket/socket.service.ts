import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { OpenAI } from 'openai';
import * as Models from '../../models/index';
import { config } from 'dotenv';
import * as Handler from "../../handler/handler";
config();
import moment from "moment";
import { role } from "../../models/message.model";
import { IErrorResponse } from "../../handler/error";
import { Types } from "mongoose";
import IMessage from "../../interfaces/message.interface";
import { INeoConfig } from "../../interfaces/common.interface";
import IChatSession from "../../interfaces/chat-session.interface";


const NEO_URL = process.env.NEO_URL as string;
const NEO_USERNAME = process.env.NEO_USERNAME as string;
const NEO_PASSWORD = process.env.NEO_PASSWORD as string;
const OPEN_API_KEY = process.env.OPEN_API_KEY as string;

const openai = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    batchSize: 512,
    apiKey: OPEN_API_KEY,
});
const open = new OpenAI({
    apiKey: OPEN_API_KEY,
})


const searchInput = async (search: string, documentId: string, ipAddressId: Types.ObjectId, sessionId: Types.ObjectId) => {
    try {
            let dataToSave: IMessage = {
                message: search,
                ipAddressId: ipAddressId,
                sessionId: sessionId,
                documentId: documentId,
                messageType: role.User,
                createdAt: moment().utc().valueOf(),
            }
            await Models.messageModel.create(dataToSave);
            const embeddingVector = await openai.embedQuery(search);

        let config: INeoConfig = {
                url: NEO_URL,
                username: NEO_USERNAME,
                password: NEO_PASSWORD
            };

            const vectorStore = await Neo4jVectorStore.fromDocuments([], openai, config); // Initialize the vector store

            const filter = { "documentId": { "$eq": documentId } };

            const searchResult = await vectorStore.similaritySearchVectorWithScore(embeddingVector, 5, "", { filter, filterType: 'exact' }); // search embeddings into vector db according to our input search embeddingVector

            let contents = searchResult.map((result: [Document, number]) => result[0].pageContent).join(" ");

            const response = await open.chat.completions.create({
                model: 'gpt-3.5-turbo-1106', 
                messages: [
                    { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge.' },
                    { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer based on context:` }
                ],
                max_tokens: 150,
                stop: ['\n'],
            }); // answers the search questions based on the content that is provided to openai.


        let dataSave: IMessage = {
                message: response?.choices[0]?.message?.content,
                ipAddressId: ipAddressId,
                sessionId: sessionId,
                documentId: documentId,
            messageType: role.AI,
                createdAt: moment().utc().valueOf(),
            }
            await Models.messageModel.create(dataSave);
            return response?.choices[0]?.message?.content;
        }
        catch (err) {
            return Handler.handleCustomError(err as IErrorResponse);
        }
}
    
const saveChatSession = async (ipAddressId: Types.ObjectId) => {
    try {
        let dataToSave: IChatSession = {
            ipAddressId: ipAddressId,
            createdAt: moment().utc().valueOf()
        }
        let response: IChatSession = await Models.chatSessionModel.create(dataToSave);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as IErrorResponse);
    }
}




export {
    searchInput,
    saveChatSession
}

