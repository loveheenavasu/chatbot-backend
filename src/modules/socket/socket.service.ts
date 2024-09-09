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
import { NeoConfig, SocketResponse } from "../../interfaces/common.interface";
import ChatSession from "../../interfaces/chat-session.interface";
import { config } from 'dotenv';
import { questionType } from "./socket";
import { documentId } from "../user/user.validation";
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

const SocketRes = async (message: string | null, sessionId: string | null, type: string, questionType?: string, nextType?: string, label?: string): Promise<SocketResponse> => {
    try {
        const response: SocketResponse = {
            message: message,
            sessionId: sessionId,
            type: type,
            questionType: questionType,
            nextType: nextType,
            label: label
        }
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}


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

const searchInput = async (search: string, documentId: string): Promise<string | null> => {
    try {
        // await saveMessage(search, documentId, ipAddressId, sessionId, Role.User); //save user search input message in db
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
        return message;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const saveChatSession = async (ipAddressId: Types.ObjectId, isFormCompleted:boolean): Promise<ChatSession> => {
    try {
        const dataToSave: ChatSession = {
            ipAddressId: ipAddressId,
            isFormCompleted: isFormCompleted,
            createdAt: moment().utc().valueOf()
        }
        const response = await Models.chatSessionModel.create(dataToSave);
        return response;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const customMessage = async (question: string, nextType: string | undefined): Promise<string> => {
    try {
        let message: string = "Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?"

        if (question == questionType.HI && nextType == questionType.NAME) {
            message = "what is your name?"
        }
        else if (question == questionType.HI && nextType == questionType.EMAIL) {
            message = "what is your email address?"
        }
        else if (question == questionType.HI && nextType == questionType.PHONE) {
            message = "what is your phone number?"
        }
        else if (question == questionType.NAME && nextType == questionType.END) {
            message = "Nice to meet you. Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?"
        }
        else if (question == questionType.EMAIL && nextType == questionType.END) {
            message = "Great. Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?"
        }
        else if (question == questionType.PHONE && nextType == questionType.END) {
            message = "Great. Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?"
        }
        else if (question == questionType.NAME && nextType == questionType.CUSTOM) {
            message = "Nice to meet you."
        }
        else if (question == questionType.EMAIL && nextType == questionType.CUSTOM) {
            message = "Great, thanks."
        }
        else if (question == questionType.PHONE && nextType == questionType.CUSTOM) {
            message = "Great, thanks."
        }
        else if (question == questionType.NAME && nextType == questionType.EMAIL) {
            message = "Nice to meet you, what's your email address?"
        }
        else if (question == questionType.NAME && nextType == questionType.PHONE) {
            message = "Nice to meet you, what's your phone number?"
        }
        else if (question == questionType.EMAIL && nextType == questionType.PHONE) {
            message = "Great, thanks. what's your phone number?"
        }
        else if (question == questionType.EMAIL && nextType == questionType.NAME) {
            message = "Great, thanks. what's your name?"
        }
        else if (question == questionType.PHONE && nextType == questionType.NAME) {
            message = "Great, thanks. what's your name?"
        }
        else if (question == questionType.PHONE && nextType == questionType.EMAIL) {
            message = "Great, thanks. what's your email address?"
        }
        return message;
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const formQues = async (documentId: string, label: string): Promise<string | undefined> => {
    try {
        const fetchData = await Models.formModel.findOne({ documentId: documentId }, { __v: 0 }, { lean: true });
        if (fetchData) {
            const result = fetchData.fields!.filter(field => field.label === label);
            const response = result[0].label;
            return response;
        }
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}

const updateChatSession = async (sessionId: Types.ObjectId) => {
    try {
        let query = { _id: sessionId }
        const update = { isFormCompleted: true }
        const data = await Models.chatSessionModel.findOneAndUpdate(query, update, { new: true })
    }
    catch (err) {
        return Handler.handleCustomError(err as ErrorResponse);
    }
}


export {
    searchInput,
    saveChatSession,
    customMessage,
    saveMessage,
    SocketRes,
    formQues,
    updateChatSession
}