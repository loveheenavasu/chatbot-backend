import { Response } from 'express';
import { IErrorResponse } from './error';


const handleSuccess = (res: Response, data: any) => {
    try {
        res.send(data);
    }  
    catch (err) {
        throw err;
    }
}

const handleCustomError = (error: IErrorResponse) => {
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

const handleCatchError = (res: Response, error: IErrorResponse) => {
    try {
        let { message } = error
        let statusCode = error?.statusCode ?? 400
        res.status(statusCode).send({ message: message });
    }
    catch (err) {
        throw err;
    }
}


const handleJoiError = (error: IErrorResponse | any) => {
        try {
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
    
export {
    handleSuccess,
    handleCustomError,
    handleCatchError,
    handleJoiError
}
