"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJoiError = exports.handleCatchError = exports.handleCustomError = exports.handleSuccess = void 0;
const handleSuccess = (res, data) => {
    try {
        res.send(data);
    }
    catch (err) {
        throw err;
    }
};
exports.handleSuccess = handleSuccess;
const handleCustomError = (error) => {
    var _a, _b;
    try {
        let message = (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Bad Request';
        let statusCode = (_b = error === null || error === void 0 ? void 0 : error.statusCode) !== null && _b !== void 0 ? _b : 400;
        throw {
            message: message,
            statusCode: statusCode
        };
    }
    catch (err) {
        throw err;
    }
};
exports.handleCustomError = handleCustomError;
const handleCatchError = (res, error) => {
    var _a;
    try {
        let { message } = error;
        let statusCode = (_a = error === null || error === void 0 ? void 0 : error.statusCode) !== null && _a !== void 0 ? _a : 400;
        res.status(statusCode).send({ message: message });
    }
    catch (err) {
        throw err;
    }
};
exports.handleCatchError = handleCatchError;
const handleJoiError = (error) => {
    var _a;
    try {
        console.log("error---", error);
        let message = (_a = error === null || error === void 0 ? void 0 : error.details[0]) === null || _a === void 0 ? void 0 : _a.message;
        let errorMessage = message.replace(/"/g, ''); // replaces all double quote character with an empty string;
        throw {
            message: errorMessage,
            statusCode: 400
        };
    }
    catch (err) {
        throw err;
    }
};
exports.handleJoiError = handleJoiError;
