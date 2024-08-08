import { Request, Response } from 'express';
import * as Service from './user.service';
import * as Handler from '../../handler/handler';
import { ErrorResponse } from '../../handler/error';
import { CustomRequest } from '../../interfaces/common.interface';

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

const chatDetail = async (req: CustomRequest, res: Response) => {
    try {
        const response = await Service.chatDetail(req);
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
    chatDetail
}
