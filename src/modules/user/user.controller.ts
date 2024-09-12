import { Request, Response } from 'express';
import * as Service from './user.service';
import * as Handler from '../../handler/handler';
import { ErrorResponse } from '../../handler/error';
import { CustomRequest } from '../../interfaces/common.interface';
import fs from 'fs';

const signup = async (req: Request, res: Response) => {
    try {
        const response = await Service.signup(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const verifyEmail = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.verifyEmail(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const resendOtp = async (req: Request, res: Response) => {
    try {
        const response = await Service.resendOtp(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const response = await Service.forgotPassword(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const verifyOtp = async (req: Request, res: Response) => {
    try {
        const response = await Service.verifyOtp(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const resetPassword = async (req: Request, res: Response) => {
    try {
        const response = await Service.resetPassword(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const response = await Service.login(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const profile = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.profile(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const socialLogin = async (req: Request, res: Response) => {
    try {
        const response = await Service.socialLogin(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const chatbotLists = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.chatbotLists(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const deleteChatbot = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.deleteChatbot(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const saveTexts = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.saveTexts(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const updateTexts = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.updateTexts(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const textDetail = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.textDetail(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const textExtract = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.textExtract(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse)
    }
}

const fileLists = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.fileLists(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const deleteFile = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.deleteFile(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}


const logout = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.logout(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const chatHistory = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.chatHistory(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const chatHistoryExport = async (req: CustomRequest, res: Response) => {
    let filePath: string | undefined;
    try {
        const response = await Service.chatHistoryExport(req);
        filePath = response?.filePath;
        res.setHeader('Content-Disposition', `attachment; filename=${response?.fileName}`);
        res.setHeader('Content-Type', `${response?.contentType}`);
        return Handler.handleSuccess(res, response?.buffer);
    }
    catch (err) {
        if (!res.headersSent) {
            return Handler.handleCatchError(res, err as ErrorResponse);  // Handle errors only if response has not been sent
        } else {
            console.error('Error occurred after headers sent:', err); // Log error but don't attempt to send another response
        }
    }
    finally {
        if (filePath) {
            fs.unlinkSync(filePath) // Clean up the temporary file
        }
    }
}

const chatDetail = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.chatDetail(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const createTheme = async (req: Request, res: Response) => {
    try {
        const response = await Service.createTheme(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const themeList = async (req: Request, res: Response) => {
    try {
        const response = await Service.themeList(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formAdd = async (req: Request, res: Response) => {
    try {
        const response = await Service.formAdd(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formDetail = async (req: Request, res: Response) => {
    try {
        const response = await Service.formDetail(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formChatbot = async (req: Request, res: Response) => {
    try {
        const response = await Service.formChatbot(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formUpdate = async (req: Request, res: Response) => {
    try {
        const response = await Service.formUpdate(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formWithIp = async (req: Request, res: Response) => {
    try {
        const response = await Service.formWithIp(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formInfoAdd = async (req: Request, res: Response) => {
    try {
        const response = await Service.formInfoAdd(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

export {
    signup,
    verifyEmail,
    resendOtp,
    forgotPassword,
    verifyOtp,
    resetPassword,
    login,
    socialLogin,
    chatbotLists,
    deleteChatbot,
    saveTexts,
    updateTexts,
    textDetail,
    textExtract,
    fileLists,
    deleteFile,
    logout,
    chatHistory,
    chatDetail,
    createTheme,
    themeList,
    formAdd,
    formDetail,
    formUpdate,
    formWithIp,
    formInfoAdd,
    formChatbot,
    profile,
    chatHistoryExport
}
