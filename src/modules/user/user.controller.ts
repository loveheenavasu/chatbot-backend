import { Request, Response} from 'express';
import * as Service from './user.service';
import * as Handler from '../../handler/handler';
import { IErrorResponse } from '../../handler/error';
import { CustomRequest } from '../../interfaces/common.interface';


const signup = async (req: Request, res: Response) => {
    try {
        let response = await Service.signup(req);
        return Handler.handleSuccess(res, response);
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const verifyEmail = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.verifyEmail(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const resendOtp = async (req: Request, res: Response) => {
        try {
            let response = await Service.resendOtp(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const forgotPassword = async (req: Request, res: Response) => {
        try {
            let response = await Service.forgotPassword(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const verifyOtp = async (req: Request, res: Response) => {
        try {
            let response = await Service.verifyOtp(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const resetPassword = async (req: Request, res: Response) => {
        try {
            let response = await Service.resetPassword(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }



const login = async (req: Request, res: Response) => {
        try {
            let response = await Service.login(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const socialLogin = async (req: Request, res: Response) => {
        try {
            let response = await Service.socialLogin(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const chatbotLists = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.chatbotLists(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const deleteChatbot = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.deleteChatbot(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const saveTexts = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.saveTexts(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const updateTexts = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.updateTexts(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const textDetail = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.textDetail(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const textExtract = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.textExtract(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse)
        }
    }

const fileLists = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.fileLists(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const deleteFile = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.deleteFile(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }


const logout = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.logout(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const chatHistory = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.chatHistory(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
        }
    }

const chatDetail = async (req: CustomRequest, res: Response) => {
        try {
            let response = await Service.chatDetail(req);
            return Handler.handleSuccess(res, response);
        }
        catch (err) {
            return Handler.handleCatchError(res, err as IErrorResponse);
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
