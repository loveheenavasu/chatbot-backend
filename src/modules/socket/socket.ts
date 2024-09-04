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
    questionType?: string;
    type?: Role
    nextType?: string;
    label?: string;
    isFormCompleted?: boolean;
}

export enum questionType {
    HI = "HI",
    NAME = "NAME",
    EMAIL = "EMAIL",
    PHONE = "PHONE",
    CUSTOM = "CUSTOM",
    END = "END"
}

const connectSocket = (server: object) => {
    try {
        const io = new Server(server, {
            cors: { origin: "*" }
        });

        io.on("connection", async (socket: Socket | any) => {
            socket.setMaxListeners(0);
            const headers = socket?.request?.headers;
            console.log("socket?.request?.headers---", socket?.request?.headers);
            console.log("socket?.conn?.remoteAddress----", socket?.conn?.remoteAddress);
            console.log("socket?.request?.connection?.remoteAddress----", socket?.request?.connection?.remoteAddress)
            let ip = headers['x-forwarded-for'] || headers['cf-connecting-ip'] || socket?.request?.connection?.remoteAddress || socket?.conn?.remoteAddress;
            if (ip && ip.includes(',')) {
                ip = ip.split(',')[0].trim()
            }

            socket.on("search", async (payload: ISocketSearch) => {
                try {
                    const { text, documentId, chatSessionId, questionType: question, type, nextType, label, isFormCompleted } = payload;
                    console.log("payload-----", payload)
                    const query = { ipAddress: ip, documentId: documentId }
                    const projection = { __v: 0 }
                    const option = { lean: true }
                    const fetchData: Ips | null = await Models.ipAddressModel.findOne(query, projection, option)
                    let ipAddressId: Types.ObjectId;
                    let sessionId: Types.ObjectId;
                    if (fetchData) {
                        ipAddressId = fetchData._id!
                        const query = { _id: new Types.ObjectId(chatSessionId), sessionType: SessionType.ONGOING }
                        const fetchSession: ChatSession | null = await Models.chatSessionModel.findOne(query, projection, option);
                        if (fetchSession) {
                            sessionId = fetchSession._id!;
                        }
                        else {
                            const sessionSave = await SocketService.saveChatSession(ipAddressId, isFormCompleted!);
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
                        const sessionSave = await SocketService.saveChatSession(ipAddressId, isFormCompleted!)
                        sessionId = sessionSave._id!;
                    }

                    if (isFormCompleted == true && type == Role.AI) {
                        const message = "Hi there! I'm Chatbot, and I'm here to help you.";
                        await sendMessage(message, Role.AI);
                    }
                    else if (isFormCompleted !== true && type == Role.AI && !question && !nextType) {
                        const message = "Hi there! I'm Chatbot, and I'm here to help you.";
                        await sendMessage(message, Role.AI);
                    }
                    else if (isFormCompleted != true && question === questionType.HI && nextType !== questionType.END) {
                        const message = "Hi there! I'm Chatbot, and I'm here to help you. Before we get started, I'd love to know a bit more about you.";
                        await sendMessage(message, Role.AI);
                        if (nextType === questionType.CUSTOM && label) {
                            const formMsg = await SocketService.formQues(documentId, label);
                            await sendMessage(formMsg!, Role.AI, label);
                        }
                        else {
                            const customMsg = await SocketService.customMessage(question, nextType);
                            await sendMessage(customMsg, Role.AI);
                        }
                    }
                    else {
                        await sendMessage(text!);
                    }


                    socket.chatSessionId = sessionId;
                    if (type == Role.User && question != null) {
                        if (question == questionType.END && nextType === questionType.END) {
                            const message = "Thank you for sharing that information. This will help me provide you with the best possible assistance. Now, how can I help you today?";
                            await SocketService.updateChatSession(isFormCompleted!, sessionId)
                            await sendMessage(message, Role.AI);
                        } else if (question !== questionType.CUSTOM && nextType !== questionType.END) {
                            let customMsg = await SocketService.customMessage(question!, nextType);
                            if (label) {
                                const formMsg = await SocketService.formQues(documentId, label);
                                customMsg += ' ' + formMsg;
                            }
                            await sendMessage(customMsg, Role.AI, label);
                        }
                        else if (question === questionType.CUSTOM && nextType === questionType.CUSTOM && label) {
                            const formMsg = await SocketService.formQues(documentId, label);
                            await sendMessage(formMsg!, Role.AI, label);
                        }
                    }
                    else if (type == Role.User && question == undefined) {
                        const message = await SocketService.searchInput(text, documentId);
                        await sendMessage(message!, Role.AI);
                    }

                    async function sendMessage(msg: string, role?: string, label?: string) {
                        await SocketService.saveMessage(msg, documentId, ipAddressId, sessionId, role ?? Role.User);
                        const res = await SocketService.SocketRes(msg, sessionId.toString(), role ?? Role.User, question, nextType, label);
                        socket.emit("searches", res);
                    }

                }
                catch (err) {
                    throw err;
                }
            })

            socket.on("disconnect", async () => {
                try {
                    const query = { _id: socket?.chatSessionId };
                    const update = {
                        sessionType: SessionType.COMPLETED,
                        // isFormCompleted: true,
                        isSessionEnd:true,
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

