import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { OpenAI } from 'openai';
import * as Models from '../../models/index';
import { config } from 'dotenv';
import Handler from "../../handler/handler";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import moment from "moment";
import { BearerToken, InvalidToken, ProvideToken } from "../../handler/error";
config();
import jwt from 'jsonwebtoken';
import { Types } from "mongoose";
import axios from "axios";
const { NEO_URL, OPEN_API_KEY, NEO_USERNAME, NEO_PASSWORD } = process.env;

const openai = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    // model: "text-embedding-ada-002",
    batchSize: 512,// Defaults to "gpt-3.5-turbo-instruct" if no model provided.
    apiKey: OPEN_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
});
const open = new OpenAI({
    apiKey: OPEN_API_KEY,
})

export default class SocketService {

    static getData = async (token: any | undefined) => {
        try {
            // console.log("token----", token)
            if (!token) {
                // return res.status(400).send({ message: 'Provide token' });
                let res = {
                    type: "error",
                    data: ProvideToken
                }
                return res;
            }

            let splitToken = token?.split(' ');
            // console.log("split token----", splitToken)
            // if (splitToken[0] != 'Bearer') {
            //     await Handler.handleCustomError(BearerToken)
            // }
            const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${splitToken[1]}`;
            let response: any
            try {
                response = await axios.get(url);
                // let decodeToken: any = await jwt?.decode(splitToken[1]);
                // const currentTime = Math?.floor(Date.now() / 1000);
                // // console.log("tokenInfo?.exp", tokenInfo?.exp); // Current time in seconds

                // if (decodeToken?.exp < currentTime) {
                //     // await Handler.handleCustomError(InvalidToken);
                //     await Models.sessionModel.deleteOne({ socialToken: splitToken[1] });
                //     let res = {
                //         type: "error",
                //         data:InvalidToken
                //     }
                //     return res;
                // }
                const tokenInfo = response?.data;
                console.log("tokenInfo=----,tokenInfo", tokenInfo)

                let query = { email: tokenInfo?.email?.toLowerCase() }
                let projection = { __v: 0, createdAt: 0, updatedAt: 0 }
                let option = { lean: true }
                let data: any = await Models.userModel.findOne(query, projection, option);
                return data;
            } catch (err: any) {
                await Models.sessionModel.deleteOne({ socialToken: splitToken[1] });
                let res = {
                        type: "error",
                        data:InvalidToken
                    }
                    return res;
                // return res.status(400).send({ message: 'Invalid token' });
                // await Handler.handleCustomError(InvalidToken);
            }

        }
        catch (err) {
            throw err;
        }
    }


    static searchInput = async (search: any, chatId: any, documentId: string) => {
        try {
            // let dataToSave = {
            //     message: search,
            //     chatId: chatId,
            //     userId: userId,
            //     createdAt: moment().utc().valueOf(),
            // }
            // await Models.messageModel.create(dataToSave);
            const embeddingVector = await openai.embedQuery(search);

            let config: any = {
                url: NEO_URL,
                username: NEO_USERNAME,
                password: NEO_PASSWORD
            };

            const vectorStore = await Neo4jVectorStore.fromDocuments([], openai, config); // Initialize the vector store

            // const searchResult = await vectorStore.similaritySearchVectorWithScore(embeddingVector, 6, search);
            // console.log("Search Result:", searchResult);

            // const query = `MATCH (n:Chunk { id: $id }) RETURN n`;
            // const params = { id: documentId?.toString() };
            // const data1 = await vectorStore.query(query, params);
            // console.log("data----", data1[0]?.n?.text)
            // // const filteredDocuments = records.map(record => record.get('n'));
            // console.log("")
            // let dbEmbed = data1[0]?.n?.embedding

            const filter = { "documentId": { "$eq": documentId?.toString() } };
            // const searchResult = await vectorStore.similaritySearchVectorWithScore(dbEmbed, 1, search);

            const searchResult = await vectorStore.similaritySearchVectorWithScore(embeddingVector, 2, "", { filter, filterType: 'exact' });
            console.log("searchResult----", searchResult);

            let contents = searchResult.map((result: [Document, number]) => result[0].pageContent).join(" ");
            // console.log("contents----", contents)

            // const response = await open.chat.completions.create({
            //     model: 'gpt-3.5-turbo-1106',
            //     messages: [{ content: `${contents}\nQuery: ${search}\nAnswer:`, role: 'user' }],
            //     max_tokens: 150,
            //     stop: ['\n'],
            // });
            // console.log("response----", response)

            const response = await open.chat.completions.create({
                model: 'gpt-3.5-turbo-1106', // Or another suitable model
                messages: [
                    { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge.' },
                    { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer based on context:` } // Adjusted content message
                    // { role: 'system', content: 'You are an assistant that only answers based on the provided content. Do not use any external knowledge.' },
                    // { role: 'user', content: `${contents}\nQuery: ${search}\nAnswer:` }
                ],
                max_tokens: 150,
                stop: ['\n'],
            });

            console.log("response----", response)

            // let data = {
            //     message: response.choices[0].message.content,
            //     chatId: chatId,
            //     // createdAt: moment().utc().valueOf(),
            // }
            // await Models.messageModel.create(data);

            return response?.choices[0]?.message?.content;

        } catch (err) {
            console.log("error----", err)
            throw await Handler.handleCustomError(err);
        }
    }

}
