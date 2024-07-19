"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// const { DB_HOST, DB_NAME, DB_PORT } = process.env;
const { URI } = process.env;
const uri = URI;
const dbConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
        mongoose_1.default.connect(uri);
    }
    catch (err) {
        throw err;
    }
});
exports.dbConnect = dbConnect;
