import { Server, Socket } from "socket.io";
import SocketService from "./socket.service";
import { Role } from "../../models/message.model";
import * as Models from '../../models/index';
import moment from "moment";
import express from "express";


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
            const ip = socket?.handshake?.address
            console.log("ip--", ip)

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
                    let clientIpAddress = socket?.handshake?.address
                    let query = { ipAddress: clientIpAddress }
                    let projection = { __v: 0 }
                    let option = { lean: true }
                    let fetchData = await Models.ipAddressModel.findOne(query, projection, option)
                    let ipAddressId: any;
                    if (fetchData) {
                        let { _id } = fetchData
                        ipAddressId = _id
                    }
                    else {
                        let dataToSave = {
                            ipAddress: clientIpAddress,
                            createdAt: moment().utc().valueOf()
                        }
                        let saveData = await Models.ipAddressModel.create(dataToSave);
                        ipAddressId = saveData?._id
                    }


                    let data = await SocketService.searchInput(text, chatId, documentId, ipAddressId);
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