import { Server, Socket } from "socket.io";
import * as SocketService from "./socket.service";
import { role } from "../../models/message.model";
import * as Models from '../../models/index';
import moment from "moment";
import { sessionType } from "../../models/chat-session.model";
import { Types } from "mongoose";
import { ISocketResponse } from "../../interfaces/common.interface";
import IIps from "../../interfaces/ips.interface";
import IChatSession from "../../interfaces/chat-session.interface";

interface ISocketSearch {
    text: string;
    documentId: string;
    chatSessionId?: string;
}


const connectSocket = (server: any) => {
    try {
        const io = new Server(server, {
            cors: { origin: "*" }
        });

        io.on("connection", async (socket: Socket | any) => {
            socket.setMaxListeners(0);

            socket.on("search", async (payload: ISocketSearch) => {
                try {
                    const headers = socket?.request?.headers;
                    let ip = headers['x-forwarded-for'] || headers['cf-connecting-ip'] || socket?.request?.connection?.remoteAddress || socket?.conn?.remoteAddress;

                    if (ip && ip.includes(',')) {
                        ip = ip.split(',')[0].trim();
                    }

                    console.log("ip---",ip)
                    let { text, documentId, chatSessionId } = payload
                    console.log("payload----", payload)
                    let res: ISocketResponse = {
                        message: text,
                        sessionId: chatSessionId ?? null,
                        type: role.User
                    }
                    socket.emit("searches", res);
                    let query = { ipAddress: ip, documentId: documentId }
                    let projection = { __v: 0 }
                    let option = { lean: true }
                    let fetchData: IIps | null = await Models.ipAddressModel.findOne(query, projection, option)
                    let ipAddressId: Types.ObjectId;
                    let sessionId: Types.ObjectId;
                    console.log("fetchData--", fetchData)
                    if (fetchData) {
                        let { _id } = fetchData
                        ipAddressId = _id!
                        let query = { _id: new Types.ObjectId(chatSessionId), sessionType: sessionType?.ONGOING }
                        let fetchSession: IChatSession | null = await Models.chatSessionModel.findOne(query, projection, option);
                        if (fetchSession) {
                            let { _id } = fetchSession;
                            sessionId = _id!;
                        }
                        else {
                            let sessionSave = await SocketService.saveChatSession(ipAddressId);
                            sessionId = sessionSave?._id!;
                        }
                    }
                    else {
                        let dataToSave: IIps = {
                            ipAddress: ip,
                            documentId: documentId,
                            createdAt: moment().utc().valueOf()
                        }
                        let saveData: IIps = await Models.ipAddressModel.create(dataToSave);
                        ipAddressId = saveData?._id!;
                        let sessionSave = await SocketService.saveChatSession(ipAddressId)
                        sessionId = sessionSave?._id!;
                    }

                    let data = await SocketService.searchInput(text, documentId, ipAddressId, sessionId);
                    let response: ISocketResponse = {
                        message: data,
                        sessionId: sessionId,
                        type: role.AI
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