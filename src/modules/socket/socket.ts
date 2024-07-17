import { Server, Socket } from "socket.io";
import SocketService from "./socket.service";
import * as Models from '../../models/index';
import { Types } from "mongoose";

enum Role {
    User = "USER",
    AI = "AI"
}

const connectSocket = (server: any) => {
    try {
        const io = new Server(server, {
            cors: { origin: "*" }
        });

        

        io.on("connection", async(socket: any | Socket) => {
            console.log("socket id----", socket.id)
            // console.log("socket", JSON.stringify(socket))
            socket.setMaxListeners(0);
            // socket.emit("hi", "hello world")

            socket.on("search", async (payload: any) => {
                try {
                    // let socketData = await SocketService.getData(socket?.handshake?.headers?.token);
                    // socket.user = socketData;
                   
                    // let { _id: userId } = socket?.user;
                    let { text, connectId, documentId } = payload
                    console.log("payload----", payload)
                    let res = {
                        message: text,
                        chatId: connectId ?? socket?.id,
                        type: Role.User
                    }
                    socket.emit("searches", res)
                    let chatId: any
                    if (connectId) {
                        chatId = connectId
                        // let fetchData = await Models.messageModel.findOne({ chatId: chatId }, { __v: 0 }, { lean: true })
                        // if (fetchData) {
                        //     let { chatId } = fetchData
                        //     chatId = chatId
                        // }
                    }
                    else {
                        chatId = socket.id
                    }
                    let userId = new Types.ObjectId("6687bf842e20c2963f0cbf5c");
                    let data = await SocketService.searchInput(text, chatId, userId, documentId);
                    let response = {
                        message: data,
                        chatId: chatId,
                        type: Role.AI
                    }
                    console.log("user-----", response)
                    console.log("chatId------", chatId)
                    // io.to(chatId).emit("searches", response)
                    // socket.emit("search_res", response)
                    socket.emit("searches", response)
                    // socket.to(chatId).emit("search_res", response)
                }
                catch (err) {
                    throw err;
                }

            })




            socket.on("disconnect", async () => {
                try {

                }
                catch (err) {
                    throw err;
                }
            })


        })
    }
    catch (err) {
        throw err;
    }
}

export {
    connectSocket
}