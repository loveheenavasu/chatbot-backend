import { error } from "neo4j-driver";
import express from 'express';
export default class Handler {

    static handleSuccess = async (res: any, data: any) => {
       res.send(data)
    }

    static handleCustomError = async (error: any) => {
        try {
            let message = error?.message ?? 'Bad Request'
            let statusCode = error?.statusCode ?? 400
            // console.log("message-----", message)
            // console.log("statusCode----", statusCode)
            throw {
                message: message,
                statusCode: statusCode
            }
        }
        catch (err) {
            // console.log("err-----",err)
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



}