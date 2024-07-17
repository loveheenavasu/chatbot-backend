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
            console.log("token----", token)
            if (!token) {
                // return res.status(400).send({ message: 'Provide token' });
                // await Handler.handleCustomError(ProvideToken);
                return;
            }

            let splitToken = token?.split(' ');
            // console.log("split token----", splitToken)
            // if (splitToken[0] != 'Bearer') {
            //     await Handler.handleCustomError(BearerToken)
            // }
            try {
                // response = await axios.get(url);
                let decodeToken: any = await jwt?.decode(splitToken[1]);
                console.log("decodeToken----", decodeToken)
                // const currentTime = Math?.floor(Date.now() / 1000);
                // console.log("currentTime----", currentTime);
                // console.log("tokenInfo?.exp", tokenInfo?.exp); // Current time in seconds

                // if (decodeToken?.exp < currentTime) {
                //     await Handler.handleCustomError(InvalidToken);
                // }
                let query = { email: decodeToken?.email?.toLowerCase() }
                let projection = { __v: 0, createdAt: 0, updatedAt: 0 }
                let option = { lean: true }
                let data: any = await Models.userModel.findOne(query, projection, option);
                console.log("data----", data)
                // data.socialToken = splitToken[1]
                return data;
            } catch (err: any) {
                console.error('Error fetching token info:', err?.response?.data || err.message);
                await Models.sessionModel.deleteOne({ socialToken: splitToken[1] });
                // return res.status(400).send({ message: 'Invalid token' });
                // await Handler.handleCustomError(InvalidToken);
            }

        }
        catch (err) {
            throw err;
        }
    }


    static searchInput = async (search: any, chatId: any, userId: Types.ObjectId | any, documentId:string) => {
        try {
            let dataToSave = {
                message: search,
                chatId: chatId,
                userId: userId,
                createdAt:moment().utc().valueOf(),
            }
            await Models.messageModel.create(dataToSave);
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

            const filter = { "id": { "$eq": documentId?.toString() } };
            // const searchResult = await vectorStore.similaritySearchVectorWithScore(dbEmbed, 1, search);
            
            const searchResult = await vectorStore.similaritySearchVectorWithScore(embeddingVector, 1, search, { filter, filterType: 'exact' });
            console.log("searchResult----", searchResult);
            
            let contents = searchResult.map((result: [Document, number]) => result[0].pageContent).join(" ");
            // console.log("contents----", contents)

            

            const response = await open.chat.completions.create({
                model: 'gpt-3.5-turbo-1106', 
                messages: [{ content: `${contents}\nQuery: ${search}\nAnswer:`, role: 'user' }],
                max_tokens: 150,
                stop: ['\n'],
            });
            console.log("response----", response)


            let data = {
                message: response.choices[0].message.content,
                chatId: chatId,
                // createdAt: moment().utc().valueOf(),
            }
            await Models.messageModel.create(data);
             
            return response.choices[0].message.content;
            // return refinedResponse;

        } catch (err) {
            // throw err;
            console.log("error----", err)
            throw await Handler.handleCustomError(err);
        }
    }
    
}
