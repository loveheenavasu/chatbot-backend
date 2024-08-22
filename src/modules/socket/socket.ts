import { Server, Socket } from "socket.io";
import * as SocketService from "./socket.service";
import { Role } from "../../models/message.model";
import * as Models from '../../models/index';
import moment from "moment";
import { SessionType } from "../../models/chat-session.model";
import { Types } from "mongoose";
import { SocketResponse } from "../../interfaces/common.interface";
import Ips from "../../interfaces/ips.interface";
import ChatSession from "../../interfaces/chat-session.interface";

interface ISocketSearch {
    text: string;
    documentId: string;
    chatSessionId?: string;
}

const connectSocket = (server: object) => {
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
                        ip = ip.split(',')[0].trim()
                    }

                    console.log("ip---",ip)
                    const { text, documentId, chatSessionId } = payload
                    const res: SocketResponse = {
                        message: text,
                        sessionId: chatSessionId ?? null,
                        type: Role.User
                    }
                    socket.emit("searches", res);
                    const query = { ipAddress: ip, documentId: documentId }
                    const projection = { __v: 0 }
                    const option = { lean: true }
                    const fetchData: Ips | null = await Models.ipAddressModel.findOne(query, projection, option)
                    let ipAddressId: Types.ObjectId;
                    let sessionId: Types.ObjectId;
                    if (fetchData) {
                        const { _id } = fetchData
                        ipAddressId = _id!
                        const query = { _id: new Types.ObjectId(chatSessionId), sessionType: SessionType.ONGOING }
                        const fetchSession: ChatSession | null = await Models.chatSessionModel.findOne(query, projection, option);
                        if (fetchSession) {
                            const { _id } = fetchSession;
                            sessionId = _id!;
                        }
                        else {
                            const sessionSave = await SocketService.saveChatSession(ipAddressId);
                            sessionId = sessionSave?._id!;
                        }
                    }
                    else {
                        const dataToSave: Ips = {
                            ipAddress: ip,
                            documentId: documentId,
                            createdAt: moment().utc().valueOf()
                        }
                        const saveData: Ips = await Models.ipAddressModel.create(dataToSave);
                        ipAddressId = saveData._id!;
                        const sessionSave = await SocketService.saveChatSession(ipAddressId)
                        sessionId = sessionSave._id!;
                    }

                    const data = await SocketService.searchInput(text, documentId, ipAddressId, sessionId);
                    const response: SocketResponse = {
                        message: data,
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
                    const query = { _id: socket?.chatSessionId }
                    const update = {
                        sessionType: SessionType.COMPLETED,
                        updatedAt: moment().utc().valueOf()
                    }
                    const options = { new: true }
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