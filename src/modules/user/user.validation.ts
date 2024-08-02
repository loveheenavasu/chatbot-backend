import express from 'express';
import Handler from '../../handler/handler';
import Joi from 'joi';

export default class Validation {

    static signup = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
                password: Joi.string().min(8).required(),
                firstname: Joi.string().trim().required(),
                lastname: Joi.string().trim().optional()
            });
            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static verify = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                otp: Joi.string().required()
            });
            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static resendAndForgot = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required()
            });
            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static verifyForgot = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
                otp: Joi.string().required()
            });
            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static resetPass = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                uniqueCode: Joi.string().trim().required(),
                password: Joi.string().min(8).required()
            });
            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static login = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
                password: Joi.string().min(8).required()
            });
            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static socialLogin = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
                firstname: Joi.string().trim().required(),
                lastname: Joi.string().trim().optional(),
                name: Joi.string().trim().optional(),
                image: Joi.string().trim().optional(),
                isAdmin: Joi.boolean().optional(),
                socialToken: Joi.string().trim().optional()
            });
            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }


    static documentId = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                documentId: Joi.string().trim().required()
            });
            let { error } = schema.validate(req.query);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static textDetail = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                documentId: Joi.string().trim().optional()
            });
            let { error } = schema.validate(req.query);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }


    static documentIdWithPL = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                documentId: Joi.string().trim().required(),
                pagination: Joi.number().optional(),
                limit: Joi.number().optional()
            });
            let { error } = schema.validate(req.query);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static sessionIdWithPL = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                sessionId: Joi.string().trim().required(),
                pagination: Joi.number().optional(),
                limit: Joi.number().optional()
            });
            let { error } = schema.validate(req.query);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }

    static deleteFile = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                documentId: Joi.string().trim().required(),
                docNo: Joi.number().required()
            });
            let { error } = schema.validate(req.query);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }


    static text = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                text: Joi.string().trim().required(),
                documentId: Joi.string().trim().optional()
            });

            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            console.log("catch--", err)
            await Handler.handleCatchError(res, err);
        }
    }

    static updateText = async (req: express.Request, res: express.Response, next: any) => {
        try {
            let schema = Joi.object({
                text: Joi.string().trim().required(),
                _id: Joi.string().trim().required()
            });

            let { error } = schema.validate(req.body);
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            console.log("catch--", err)
            await Handler.handleCatchError(res, err);
        }
    }

    static uploadFile = async (req: express.Request, res: express.Response, next: any) => {
        try {
            const schema = Joi.object({
                documentId: Joi.string().optional(),
                file: Joi.object().required()
            });
            let { error } = schema.validate({
                documentId: req.body.documentId,
                file: req.file
            });
            if (error) await Handler.handleJoiError(error);
            next();
        }
        catch (err) {
            await Handler.handleCatchError(res, err);
        }
    }


}

