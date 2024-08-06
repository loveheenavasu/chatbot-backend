"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvideDocumentId = exports.UnsupportedFileType = exports.NotFound = exports.TokenMismatch = exports.InvalidToken = exports.BearerToken = exports.ProvideToken = exports.WrongOtp = exports.EmailAlreadyExists = exports.EmailNotRegistered = exports.RegisteredWithGoogle = exports.SomethingWentWrong = exports.WrongPassword = exports.Unauthorized = void 0;
exports.Unauthorized = {
    message: "Sorry, you are not authorized to perform this action.",
    statusCode: 401
};
exports.WrongPassword = {
    message: "Sorry, you entered wrong password",
    statusCode: 400
};
exports.SomethingWentWrong = {
    message: "Something went wrong",
    statusCode: 400
};
exports.RegisteredWithGoogle = {
    message: "You're registered with Google. Please log in using your Google account.",
    statusCode: 400
};
exports.EmailNotRegistered = {
    message: "Sorry, this email is not registered with us",
    statusCode: 400
};
exports.EmailAlreadyExists = {
    message: "Sorry, this email is already registered with us",
    statusCode: 400
};
exports.WrongOtp = {
    message: "Wrong otp",
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
