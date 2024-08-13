"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvideDocumentId = exports.UnsupportedFileType = exports.NotFound = exports.TokenMismatch = exports.InvalidToken = exports.BearerToken = exports.ProvideToken = exports.WrongOtp = exports.EmailAlreadyExists = exports.EmailNotRegistered = exports.RegisteredWithPassword = exports.RegisteredWithGoogle = exports.SomethingWentWrong = exports.WrongPassword = exports.Unauthorized = void 0;
exports.Unauthorized = {
    message: "You are not authorized to perform this action.",
    statusCode: 401
};
exports.WrongPassword = {
    message: "The password you entered is incorrect. Please try again.",
    statusCode: 400
};
exports.SomethingWentWrong = {
    message: "Something went wrong",
    statusCode: 400
};
exports.RegisteredWithGoogle = {
    message: "You are registered with Google. Please log in with your Google account.",
    statusCode: 400
};
exports.RegisteredWithPassword = {
    message: "You are registered using an email and password. Please log in using your password.",
    statusCode: 400
};
exports.EmailNotRegistered = {
    message: "This email address is not registered with us. Please check and try again.",
    statusCode: 400
};
exports.EmailAlreadyExists = {
    message: "This email address is already registered. Please use a different email or log in with the existing one.",
    statusCode: 400
};
exports.WrongOtp = {
    message: "The OTP you entered is incorrect. Please try again.",
    statusCode: 400
};
exports.ProvideToken = {
    message: "Please provide token",
    statusCode: 401
};
exports.BearerToken = {
    message: "Not a bearer token",
    statusCode: 400
};
exports.InvalidToken = {
    message: "Invalid token",
    statusCode: 401
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
    message: "Please provide documentId",
    statusCode: 400
};
