import express from 'express';
import Service from './user.service';
import Handler from '../../handler/handler';

export default class Controller {

    static signup = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.signup(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static verifyEmail = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.verifyEmail(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static resendOtp = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.resendOtp(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static forgotPassword = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.forgotPassword(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    } 

    static verifyOtp = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.verifyOtp(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static resetPassword = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.resetPassword(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    

    static login = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.login(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    // static profile = async (req: express.Request | any, res: express.Response) => {
    //     try {
    //         let response = await Service.profile(req);
    //         await Handler.handleSuccess(res, response);
    //     }
    //     catch (err) {
    //         await Handler.handleCatchError(res, err);
    //     }
    // }

    static socialLogin = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.socialLogin(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }
    
    static chatbotLists = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.chatbotLists(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static deleteChatbot = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.deleteChatbot(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static saveTexts = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.saveTexts(req);
            Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static updateTexts = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.updateTexts(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static textDetail = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.textDetail(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static textExtract = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.textExtract(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err)
        }
    }

    static fileLists = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.fileLists(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static deleteFile = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.deleteFile(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }


    static logout = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.logout(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    // static url = async (req: express.Request | any, res: express.Response) => {
    //     try {
    //         let response = await Service.url(req);
    //         await Handler.handleSuccess(res, response);
    //     }
    //     catch (err) {
    //         await Handler.handleCatchError(res, err);
    //     }
    // }

    
}