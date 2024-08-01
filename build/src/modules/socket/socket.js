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
const socket_service_1 = __importDefault(require("./socket.service"));
const message_model_1 = require("../../models/message.model");
const Models = __importStar(require("../../models/index"));
const moment_1 = __importDefault(require("moment"));
const chat_session_model_1 = require("../../models/chat-session.model");
const connectSocket = (server) => {
    try {
        const io = new socket_io_1.Server(server, {
            cors: { origin: "*" }
        });
        // !! ---->>>   MIDDLEWARE FOR AUTH   <<<----
        // io.use(async (socket: Socket | any, next) => {
        //     try {
        //         const token = socket?.handshake?.headers?.token;
        //         let socketData = await SocketService.getData(token);
        //         if (socketData?.type === 'error') {
        //             return next(socketData?.data);
        //         } else {
        //             console.log('socket data - else---', socketData);
        //             socket.user = socketData;
        //             return next();zsxs
        //         }
        //     } catch (err) {
        //         console.error('Error in middleware:', err);
        //         return next(new Error('Internal server error'));
        //     }
        // });
        io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
            socket.setMaxListeners(0);
            socket.on("search", (payload) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                try {
                    // let { _id: userId } = socket?.user;
                    const headers = (_a = socket === null || socket === void 0 ? void 0 : socket.request) === null || _a === void 0 ? void 0 : _a.headers;
                    console.log("headers------", headers);
                    let ip = headers['x-forwarded-for'] || headers['cf-connecting-ip'] || ((_c = (_b = socket === null || socket === void 0 ? void 0 : socket.request) === null || _b === void 0 ? void 0 : _b.connection) === null || _c === void 0 ? void 0 : _c.remoteAddress) || ((_d = socket === null || socket === void 0 ? void 0 : socket.conn) === null || _d === void 0 ? void 0 : _d.remoteAddress);
                    if (ip && ip.includes(',')) {
                        ip = ip.split(',')[0].trim();
                    }
                    console.log("ip-----", ip);
                    let { text, connectId, documentId, chatSessionId } = payload;
                    console.log("payload----", payload);
                    let res = {
                        message: text,
                        chatId: connectId !== null && connectId !== void 0 ? connectId : socket === null || socket === void 0 ? void 0 : socket.id,
                        sessionId: chatSessionId !== null && chatSessionId !== void 0 ? chatSessionId : null,
                        type: message_model_1.Role.User
                    };
                    socket.emit("searches", res);
                    let chatId;
                    // if (connectId) {
                    //     chatId = connectId
                    //     // let fetchData = await Models.messageModel.findOne({ chatId: chatId }, { __v: 0 }, { lean: true })
                    //     // if (fetchData) {
                    //     //     let { chatId } = fetchData
                    //     //     chatId = chatId
                    //     // }
                    // }
                    // else {
                    //     chatId = socket.id
                    // }
                    let clientIpAddress = ip;
                    let query = { ipAddress: clientIpAddress };
                    let projection = { __v: 0 };
                    let option = { lean: true };
                    let fetchData = yield Models.ipAddressModel.findOne(query, projection, option);
                    let ipAddressId;
                    let sessionId;
                    if (fetchData) {
                        let { _id } = fetchData;
                        ipAddressId = _id;
                        let query = { _id: chatSessionId, sessionType: chat_session_model_1.sessionType === null || chat_session_model_1.sessionType === void 0 ? void 0 : chat_session_model_1.sessionType.ONGOING };
                        let fetchSession = yield Models.chatSessionModel.findOne(query, projection, option);
                        if (fetchSession) {
                            let { _id } = fetchSession;
                            sessionId = _id;
                        }
                        else {
                            let sessionSave = yield socket_service_1.default.saveChatSession(ipAddressId);
                            sessionId = sessionSave === null || sessionSave === void 0 ? void 0 : sessionSave._id;
                        }
                    }
                    else {
                        let dataToSave = {
                            ipAddress: clientIpAddress,
                            documentId: documentId,
                            createdAt: (0, moment_1.default)().utc().valueOf()
                        };
                        let saveData = yield Models.ipAddressModel.create(dataToSave);
                        ipAddressId = saveData === null || saveData === void 0 ? void 0 : saveData._id;
                        let sessionSave = yield socket_service_1.default.saveChatSession(ipAddressId);
                        sessionId = sessionSave === null || sessionSave === void 0 ? void 0 : sessionSave._id;
                    }
                    let data = yield socket_service_1.default.searchInput(text, chatId, documentId, ipAddressId, sessionId);
                    let response = {
                        message: data,
                        chatId: chatId,
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
                    console.log("socket disconnected--------");
                    // console.log("socket discconect----", socket);
                    console.log("chatSessionId-----", socket === null || socket === void 0 ? void 0 : socket.chatSessionId);
                    let query = { _id: socket === null || socket === void 0 ? void 0 : socket.chatSessionId };
                    let update = {
                        sessionType: chat_session_model_1.sessionType === null || chat_session_model_1.sessionType === void 0 ? void 0 : chat_session_model_1.sessionType.COMPLETED,
                        updatedAt: (0, moment_1.default)().utc().valueOf()
                    };
                    let options = { new: true };
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
