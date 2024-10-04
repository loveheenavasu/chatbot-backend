import { Response, Request, NextFunction } from 'express';
import * as Handler from '../../handler/handler';
import Joi from 'joi';
import { ErrorResponse } from '../../handler/error';

const signup = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: Joi.string().min(8).required(),
            firstname: Joi.string().trim().required(),
            lastname: Joi.string().trim().optional()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const verify = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            otp: Joi.string().required()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const resendAndForgot = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const verifyForgot = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            otp: Joi.string().required()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const resetPassword = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            uniqueCode: Joi.string().trim().required(),
            password: Joi.string().min(8).required()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const login = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            password: Joi.string().min(8).required()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const socialLogin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().trim().messages({ "string.email": "Please enter valid email address" }).required(),
            firstname: Joi.string().trim().required(),
            lastname: Joi.string().trim().optional(),
            name: Joi.string().trim().optional(),
            image: Joi.string().trim().optional(),
            isAdmin: Joi.boolean().optional(),
            socialToken: Joi.string().trim().optional()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}


const documentId = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().trim().required()
        });
        const { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const textDetail = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().trim().optional()
        });
        const { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}


const documentIdWithPL = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().trim().optional(),
            pagination: Joi.number().optional(),
            limit: Joi.number().optional(),
            startDate: Joi.string().optional(),
            endDate: Joi.string().optional(),
            exportFile: Joi.string().optional(),
            timezone: Joi.string().optional()
        });
        const { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const sessionIdWithPL = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            sessionId: Joi.string().trim().required(),
            pagination: Joi.number().optional(),
            limit: Joi.number().optional()
        });
        const { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const deleteFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().trim().required(),
            docNo: Joi.number().required()
        });
        const { error } = schema.validate(req.query);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}


const text = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            text: Joi.string().trim().required(),
            documentId: Joi.string().trim().optional()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const updateText = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            text: Joi.string().trim().required(),
            _id: Joi.string().trim().required()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().optional(),
            file: Joi.object().required()
        });
        const { error } = schema.validate({
            documentId: req.body.documentId,
            file: req.file
        });
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}


const themeCreate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().trim().required(),
            primaryTheme: Joi.string().trim().required(),
            primaryText: Joi.string().trim().required(),
            secondaryTheme: Joi.string().trim().required(),
            secondaryText: Joi.string().trim().required(),
        })
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formAdd = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().trim().required(),
            fields: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    type: Joi.string().required(),
                    label: Joi.string().required(),
                    isRequired: Joi.boolean().optional(),
                    isCustom: Joi.boolean().optional()
                })
            ).optional()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formUpdate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            _id: Joi.string().trim().required(),
            fields: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    type: Joi.string().required(),
                    label: Joi.string().required(),
                    isRequired: Joi.boolean().optional(),
                    isCustom: Joi.boolean().optional()
                })
            ).optional()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
    }
}

const formInfoAdd = (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = Joi.object({
            documentId: Joi.string().required(),
            fields: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    type: Joi.string().required(),
                    label: Joi.string().required(),
                    value: Joi.string().optional()
                })
            ).optional()
        });
        const { error } = schema.validate(req.body);
        if (error) return Handler.handleJoiError(error);
        next();
    }
    catch (err) {
        return Handler.handleCatchError(res, err as ErrorResponse);
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
    uploadFile,
    themeCreate,
    formAdd,
    formUpdate,
    formInfoAdd
}

