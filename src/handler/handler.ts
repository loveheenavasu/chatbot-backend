import express from 'express';

export default class Handler {

    static handleSuccess = async (res: any, data: any) => {
       res.send(data)
    }

    static handleCustomError = async (error: any) => {
        try {
            let message = error?.message ?? 'Bad Request'
            let statusCode = error?.statusCode ?? 400
            throw {
                message: message,
                statusCode: statusCode
            }
        }
        catch (err) {
            throw err;
        }
    }

    static handleCatchError = async (res: any, error: any) => {
            let { message, statusCode } = error
            res.status(statusCode).send({ message: message });
    }

    static handleSocketError = async (error: any) => {
        let { message, statusCode } = error
        express?.response?.status(statusCode).send({ message: message });
    }

    static handleJoiError = async (error: any) => {
        try {
            console.log("error---", error)
            let message = error?.details[0]?.message;
            let errorMessage = message.replace(/"/g, ''); // replaces all double quote character with an empty string;
            throw {
                message: errorMessage,
                statusCode: 400
            }
        }
        catch (err) {
            throw err;
        }
        
    }



}