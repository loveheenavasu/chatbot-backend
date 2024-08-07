"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const URI = process.env.URI;
const dbConnect = () => {
    try {
        mongoose_1.default.connect(URI);
    }
    catch (err) {
        throw err;
    }
};
exports.dbConnect = dbConnect;
