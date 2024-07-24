import express from 'express';
import Service from './user.service';
import Handler from '../../handler/handler';

export default class Controller {

    static login = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.login(req);
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

    

}