"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.langChai = void 0;
const openai_1 = require("@langchain/openai");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { OPEN_API_KEY } = process.env;
console.log("open api -", OPEN_API_KEY);
// const langChain = new ChatOpenAI({
//     apiKey: OPEN_API_KEY,
//     modelName: "gpt-4-1106-preview",
//     // modelName:'tts-1'
// });
const langChai = new openai_1.OpenAI({
    apiKey: OPEN_API_KEY,
    modelName: "gpt-4-1106-preview",
    // modelName:'tts-1'
});
exports.langChai = langChai;
