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

    static embeddingsCreate = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.embeddingsCreate(req);
            Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static searchInput = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.searchInput(req);
            Handler.handleSuccess(res, response);
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

    static textLists = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.textLists(req);
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

    static deleteText = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.textDelete(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }


    static chatList = async (req: express.Request | any, res: express.Response) => {
        try {
            let response = await Service.chatList(req);
            await Handler.handleSuccess(res, response);
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

}