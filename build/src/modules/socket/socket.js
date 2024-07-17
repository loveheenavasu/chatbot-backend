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
exports.connectSocket = void 0;
const socket_io_1 = require("socket.io");
const socket_service_1 = __importDefault(require("./socket.service"));
const mongoose_1 = require("mongoose");
var Role;
(function (Role) {
    Role["User"] = "USER";
    Role["AI"] = "AI";
})(Role || (Role = {}));
const connectSocket = (server) => {
    try {
        const io = new socket_io_1.Server(server, {
            cors: { origin: "*" }
        });
        io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("socket id----", socket.id);
            // console.log("socket", JSON.stringify(socket))
            socket.setMaxListeners(0);
            // socket.emit("hi", "hello world")
            socket.on("search", (payload) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // let socketData = await SocketService.getData(socket?.handshake?.headers?.token);
                    // socket.user = socketData;
                    // let { _id: userId } = socket?.user;
                    let { text, connectId, documentId } = payload;
                    console.log("payload----", payload);
                    let res = {
                        message: text,
                        chatId: connectId !== null && connectId !== void 0 ? connectId : socket === null || socket === void 0 ? void 0 : socket.id,
                        type: Role.User
                    };
                    socket.emit("searches", res);
                    let chatId;
                    if (connectId) {
                        chatId = connectId;
                        // let fetchData = await Models.messageModel.findOne({ chatId: chatId }, { __v: 0 }, { lean: true })
                        // if (fetchData) {
                        //     let { chatId } = fetchData
                        //     chatId = chatId
                        // }
                    }
                    else {
                        chatId = socket.id;
                    }
                    let userId = new mongoose_1.Types.ObjectId("6687bf842e20c2963f0cbf5c");
                    let data = yield socket_service_1.default.searchInput(text, chatId, userId, documentId);
                    let response = {
                        message: data,
                        chatId: chatId,
                        type: Role.AI
                    };
                    console.log("user-----", response);
                    console.log("chatId------", chatId);
                    // io.to(chatId).emit("searches", response)
                    // socket.emit("search_res", response)
                    socket.emit("searches", response);
                    // socket.to(chatId).emit("search_res", response)
                }
                catch (err) {
                    throw err;
                }
            }));
            socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
                try {
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
