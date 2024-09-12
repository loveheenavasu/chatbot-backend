import Chatbot from "../interfaces/chatbot.interface";
import Forms from "../interfaces/form.interface";
import UserInfo from "../interfaces/information.interface";
import Message from "../interfaces/message.interface";
import Text from "../interfaces/text.interface";
import User from "../interfaces/user.interface";

export type UserResponse = {
    message?: string;
    data: User
}

export type Response = {
    message: string;
    data: Text
}

export type FormResponse = {
    message: string;
    data?: Forms
}

export type UserInfoResponse = {
    message: string;
    data: UserInfo
}

export type MessageResponse = {
    message: string
}

export type VerifyResponse = {
    message: string;
    uniqueCode: string
}

export type ResponseList = {
    count: number;
    data: Text[];
}

export type ChatbotResponse = {
    count: number;
    data: Chatbot[];
}

export type MessageResponseList = {
    count: number;
    data: Message[]
}

export type List = {
    _id: string;
    ipAddress: string;
    documentId: string;
    sessionType: string;
    message: Message[]
}

export type ChatHistory = {
    count: number;
    data: List[]
}

export type FormChatbot = {
    isFormCompleted?: boolean;
    data: Forms
}

export type message = {
    role: string,
    message: string
}

export type ConvoData = {
    sessionId: string,
    startDate: string,
    endDate: string,
    messages?: message[]
}

export type arrangeChatHistoryData = {
    chatbotId: string,
    chatbotName: string,
    date: string,
    conversations: ConvoData[]
}


export type ExportData = {
    fileName: string;
    contentType: string;
    buffer: Buffer;
    filePath?: string;
}