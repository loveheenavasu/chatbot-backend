"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvideDocumentId = exports.UnsupportedFileType = exports.NotFound = exports.TokenMismatch = exports.InvalidToken = exports.BearerToken = exports.ProvideToken = exports.EmailNotRegistered = exports.WrongPassword = void 0;
exports.WrongPassword = {
    message: "Sorry, you entered wrong password",
    statusCode: 400
};
exports.EmailNotRegistered = {
    message: "Sorry, email is not registered with us",
    statusCode: 400
};
exports.ProvideToken = {
    message: "Please provide token",
    statusCode: 400
};
exports.BearerToken = {
    message: "Not a bearer token",
    statusCode: 400
};
exports.InvalidToken = {
    message: "Invalid token",
    statusCode: 400
};
exports.TokenMismatch = {
    message: "Token mismatch",
    statusCode: 400
};
exports.NotFound = {
    message: "Not found",
    statusCode: 404
};
exports.UnsupportedFileType = {
    message: "Unsupported file type"
};
exports.ProvideDocumentId = {
    message: "Please documentId",
    statusCode: 400
};
