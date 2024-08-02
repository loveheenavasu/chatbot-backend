import { Server, Socket } from "socket.io";
import SocketService from "./socket.service";
import { Role } from "../../models/message.model";
import * as Models from '../../models/index';
import moment from "moment";
import express from "express";
import { sessionType } from "../../models/chat-session.model";


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


        io.on("connection", async (socket: any | Socket) => {
            socket.setMaxListeners(0);

            socket.on("search", async (payload: any) => {
                try {
                    // let { _id: userId } = socket?.user;
                    const headers = socket?.request?.headers;
                    console.log("headers------", headers)
                    let ip = headers['x-forwarded-for'] || headers['cf-connecting-ip'] || socket?.request?.connection?.remoteAddress || socket?.conn?.remoteAddress;

                    if (ip && ip.includes(',')) {
                        ip = ip.split(',')[0].trim();
                    }

                    console.log("ip-----", ip)

                    let { text, connectId, documentId, chatSessionId } = payload
                    console.log("payload----", payload)
                    let res = {
                        message: text,
                        chatId: connectId ?? socket?.id,
                        sessionId: chatSessionId ?? null,
                        type: Role.User
                    }
                    socket.emit("searches", res);
                    let chatId: any;
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
                    let query = { ipAddress: clientIpAddress }
                    let projection = { __v: 0 }
                    let option = { lean: true }
                    let fetchData = await Models.ipAddressModel.findOne(query, projection, option)
                    let ipAddressId: any;
                    let sessionId: any;
                    if (fetchData) {
                        let { _id } = fetchData
                        ipAddressId = _id
                        let query = { _id: chatSessionId, sessionType: sessionType?.ONGOING }
                        let fetchSession = await Models.chatSessionModel.findOne(query, projection, option);
                        if (fetchSession) {
                            let { _id } = fetchSession;
                            sessionId = _id;
                        }
                        else {
                            let sessionSave = await SocketService.saveChatSession(ipAddressId);
                            sessionId = sessionSave?._id;
                        }
                    }
                    else {
                        let dataToSave = {
                            ipAddress: clientIpAddress,
                            documentId: documentId,
                            createdAt: moment().utc().valueOf()
                        }
                        let saveData = await Models.ipAddressModel.create(dataToSave);
                        ipAddressId = saveData?._id;
                        let sessionSave = await SocketService.saveChatSession(ipAddressId)
                        sessionId = sessionSave?._id;
                    }

                    let data = await SocketService.searchInput(text, chatId, documentId, ipAddressId, sessionId);
                    let response = {
                        message: data,
                        chatId: chatId,
                        sessionId: sessionId,
                        type: Role.AI
                    }
                    socket.chatSessionId = sessionId
                    socket.emit("searches", response);
                }
                catch (err) {
                    throw err;
                }
            })

            socket.on("disconnect", async () => {
                try {
                    console.log("socket disconnected--------");
                    // console.log("socket discconect----", socket);
                    console.log("chatSessionId-----", socket?.chatSessionId);
                    let query = { _id: socket?.chatSessionId }
                    let update = {
                        sessionType: sessionType?.COMPLETED,
                        updatedAt: moment().utc().valueOf()
                    }
                    let options = { new: true }
                    await Models.chatSessionModel.findOneAndUpdate(query, update, options);
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