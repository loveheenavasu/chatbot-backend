import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { config } from 'dotenv';
config();

const { OPEN_API_KEY } = process.env;
console.log("open api -", OPEN_API_KEY)

// const langChain = new ChatOpenAI({
//     apiKey: OPEN_API_KEY,
//     modelName: "gpt-4-1106-preview",
//     // modelName:'tts-1'
// });

const langChain = new OpenAI({
    apiKey: OPEN_API_KEY,
    modelName: "gpt-4-1106-preview",
    // modelName:'tts-1'
});

export {langChain};
