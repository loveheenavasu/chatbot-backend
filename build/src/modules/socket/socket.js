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
exports.connectSocket = void 0;
const socket_io_1 = require("socket.io");
const SocketService = __importStar(require("./socket.service"));
const message_model_1 = require("../../models/message.model");
const Models = __importStar(require("../../models/index"));
const moment_1 = __importDefault(require("moment"));
const chat_session_model_1 = require("../../models/chat-session.model");
const mongoose_1 = require("mongoose");
const connectSocket = (server) => {
    try {
        const io = new socket_io_1.Server(server, {
            cors: { origin: "*" }
        });
        io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
            socket.setMaxListeners(0);
            socket.on("search", (payload) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                try {
                    const headers = (_a = socket === null || socket === void 0 ? void 0 : socket.request) === null || _a === void 0 ? void 0 : _a.headers;
                    let ip = headers['x-forwarded-for'] || headers['cf-connecting-ip'] || ((_c = (_b = socket === null || socket === void 0 ? void 0 : socket.request) === null || _b === void 0 ? void 0 : _b.connection) === null || _c === void 0 ? void 0 : _c.remoteAddress) || ((_d = socket === null || socket === void 0 ? void 0 : socket.conn) === null || _d === void 0 ? void 0 : _d.remoteAddress);
                    if (ip && ip.includes(',')) {
                        ip = ip.split(',')[0].trim();
                    }
                    console.log("ip---", ip);
                    const { text, documentId, chatSessionId } = payload;
                    console.log("payload----", payload);
                    const res = {
                        message: text,
                        sessionId: chatSessionId !== null && chatSessionId !== void 0 ? chatSessionId : null,
                        type: message_model_1.Role.User
                    };
                    socket.emit("searches", res);
                    const query = { ipAddress: ip, documentId: documentId };
                    const projection = { __v: 0 };
                    const option = { lean: true };
                    const fetchData = yield Models.ipAddressModel.findOne(query, projection, option);
                    let ipAddressId;
                    let sessionId;
                    if (fetchData) {
                        const { _id } = fetchData;
                        ipAddressId = _id;
                        const query = { _id: new mongoose_1.Types.ObjectId(chatSessionId), sessionType: chat_session_model_1.SessionType.ONGOING };
                        const fetchSession = yield Models.chatSessionModel.findOne(query, projection, option);
                        if (fetchSession) {
                            const { _id } = fetchSession;
                            sessionId = _id;
                        }
                        else {
                            const sessionSave = yield SocketService.saveChatSession(ipAddressId);
                            sessionId = sessionSave === null || sessionSave === void 0 ? void 0 : sessionSave._id;
                        }
                    }
                    else {
                        const dataToSave = {
                            ipAddress: ip,
                            documentId: documentId,
                            createdAt: (0, moment_1.default)().utc().valueOf()
                        };
                        const saveData = yield Models.ipAddressModel.create(dataToSave);
                        ipAddressId = saveData._id;
                        const sessionSave = yield SocketService.saveChatSession(ipAddressId);
                        sessionId = sessionSave._id;
                    }
                    const data = yield SocketService.searchInput(text, documentId, ipAddressId, sessionId);
                    const response = {
                        message: data,
                        sessionId: sessionId,
                        type: message_model_1.Role.AI
                    };
                    socket.chatSessionId = sessionId;
                    socket.emit("searches", response);
                }
                catch (err) {
                    throw err;
                }
            }));
            socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const query = { _id: socket === null || socket === void 0 ? void 0 : socket.chatSessionId };
                    const update = {
                        sessionType: chat_session_model_1.SessionType.COMPLETED,
                        updatedAt: (0, moment_1.default)().utc().valueOf()
                    };
                    const options = { new: true };
                    yield Models.chatSessionModel.findOneAndUpdate(query, update, options);
                }
                catch (err) {
                    throw err;
                }
            }));
        }));
    }
    catch (err) {
        throw err;
    }
};
exports.connectSocket = connectSocket;
