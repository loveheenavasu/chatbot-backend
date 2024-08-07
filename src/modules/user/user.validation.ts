import { Response, Request, NextFunction } from 'express';
import * as Handler from '../../handler/handler';
import Joi from 'joi';
import { IErrorResponse } from '../../handler/error';

const signup = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: Joi.string().min(8).required(),
            firstname: Joi.string().trim().required(),
            lastname: Joi.string().trim().optional()
        });
        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const verify = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            otp: Joi.string().required()
        });
        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const resendAndForgot = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required()
        });
        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const verifyForgot = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            otp: Joi.string().required()
        });
        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const resetPassword = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            uniqueCode: Joi.string().trim().required(),
            password: Joi.string().min(8).required()
        });
        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const login = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: Joi.string().min(8).required()
        });
        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const socialLogin = (req: Request, res: Response, next: NextFunction) => {
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
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}


const documentId = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            documentId: Joi.string().trim().required()
        });
        let { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const textDetail = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            documentId: Joi.string().trim().optional()
        });
        let { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}


const documentIdWithPL = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            documentId: Joi.string().trim().required(),
            pagination: Joi.number().optional(),
            limit: Joi.number().optional()
        });
        let { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const sessionIdWithPL = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            sessionId: Joi.string().trim().required(),
            pagination: Joi.number().optional(),
            limit: Joi.number().optional()
        });
        let { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const deleteFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            documentId: Joi.string().trim().required(),
            docNo: Joi.number().required()
        });
        let { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}


const text = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            text: Joi.string().trim().required(),
            documentId: Joi.string().trim().optional()
        });

        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const updateText = (req: Request, res: Response, next: NextFunction) => {
    try {
        let schema = Joi.object({
            text: Joi.string().trim().required(),
            _id: Joi.string().trim().required()
        });

        let { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().optional(),
            file: Joi.object().required()
        });
        let { error } = schema.validate({
            documentId: req.body.documentId,
            file: req.file
        });
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as IErrorResponse);
    }
}

export {
    signup,
    verify,
    resendAndForgot,
    verifyForgot,
    resetPassword,
    login,
    socialLogin,
    documentId,
    textDetail,
    documentIdWithPL,
    sessionIdWithPL,
    deleteFile,
    text,
    updateText,
    uploadFile
}

