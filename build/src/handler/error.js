"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = exports.BearerToken = exports.TokenMismatch = exports.InvalidToken = exports.ProvideToken = exports.EmailNotRegistered = exports.WrongPassword = void 0;
const WrongPassword = {
    message: "Sorry, you entered wrong password",
    statusCode: 400
};
exports.WrongPassword = WrongPassword;
const EmailNotRegistered = {
    message: "Sorry, email is not registered with us",
    statusCode: 400
};
exports.EmailNotRegistered = EmailNotRegistered;
const ProvideToken = {
    message: "Please provide token",
    statusCode: 400
};
exports.ProvideToken = ProvideToken;
const BearerToken = {
    message: "Not a bearer token",
    statusCode: 400
};
exports.BearerToken = BearerToken;
const InvalidToken = {
    message: "Invalid token",
    statusCode: 400
};
exports.InvalidToken = InvalidToken;
const TokenMismatch = {
    message: "Token mismatch",
    statusCode: 400
};
exports.TokenMismatch = TokenMismatch;
const NotFound = {
    message: "Not found",
    statusCode: 404
};
exports.NotFound = NotFound;
