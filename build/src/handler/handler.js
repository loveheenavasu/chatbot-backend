"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
class Handler {
}
_a = Handler;
Handler.handleSuccess = (res, data) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(data);
});
Handler.handleCustomError = (error) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        let message = (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Bad Request';
        let statusCode = (_c = error === null || error === void 0 ? void 0 : error.statusCode) !== null && _c !== void 0 ? _c : 400;
        throw {
            message: message,
            statusCode: statusCode
        };
    }
    catch (err) {
        throw err;
    }
});
Handler.handleCatchError = (res, error) => __awaiter(void 0, void 0, void 0, function* () {
    let { message, statusCode } = error;
    res.status(statusCode).send({ message: message });
});
Handler.handleSocketError = (error) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let { message, statusCode } = error;
    (_b = express_1.default === null || express_1.default === void 0 ? void 0 : express_1.default.response) === null || _b === void 0 ? void 0 : _b.status(statusCode).send({ message: message });
});
exports.default = Handler;
