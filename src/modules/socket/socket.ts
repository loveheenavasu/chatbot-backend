import { Server, Socket } from "socket.io";
import SocketService from "./socket.service";

enum Role {
    User = "USER",
    AI = "AI"
}

const connectSocket = (server: any) => {
    try {
        const io = new Server(server, {
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

    
        io.on("connection", async(socket: any | Socket) => {
            console.log("socket id----", socket.id)
            socket.setMaxListeners(0);

            
            socket.on("search", async (payload: any) => {
                try {
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
                    let data = await SocketService.searchInput(text, chatId, documentId);
                    let response = {
                        message: data,
                        chatId: chatId,
                        type: Role.AI
                    }
                    socket.emit("searches", response)
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