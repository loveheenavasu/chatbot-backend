"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.session = exports.driver = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const Handler = __importStar(require("../handler/handler"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const NEO_URL = process.env.NEO_URL;
const NEO_USERNAME = process.env.NEO_USERNAME;
const NEO_PASSWORD = process.env.NEO_PASSWORD;
const driver = neo4j_driver_1.default.driver(NEO_URL, neo4j_driver_1.default.auth.basic(NEO_USERNAME, NEO_PASSWORD));
exports.driver = driver;
const getServerInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serverInfo = yield driver.getServerInfo();
        console.log("serverInfo----", serverInfo);
    }
    catch (err) {
        return Handler.handleCustomError(err);
    }
});
getServerInfo();
const session = driver.session({ database: 'neo4j' });
exports.session = session;
