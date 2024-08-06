export interface IErrorResponse {
    message: string;
    statusCode?: number;
}

export const Unauthorized: IErrorResponse = {
    message: "Sorry, you are not authorized to perform this action.",
    statusCode: 401
}

export const WrongPassword: IErrorResponse = {
    message: "Sorry, you entered wrong password",
    statusCode: 400
}

export const SomethingWentWrong: IErrorResponse = {
    message: "Something went wrong",
    statusCode: 400
}

export const RegisteredWithGoogle: IErrorResponse = {
    message: "You're registered with Google. Please log in using your Google account.",
    statusCode: 400
}

export const EmailNotRegistered: IErrorResponse = {
    message: "Sorry, this email is not registered with us",
    statusCode: 400
}

export const EmailAlreadyExists: IErrorResponse = {
    message: "Sorry, this email is already registered with us",
    statusCode: 400
}

export const WrongOtp: IErrorResponse = {
    message: "Wrong otp",
    statusCode: 400
}
export const ProvideToken: IErrorResponse = {
    message: "Please provide token",
    statusCode: 400
}

export const BearerToken: IErrorResponse = {
    message: "Not a bearer token",
    statusCode: 400
}

export const InvalidToken: IErrorResponse = {
    message: "Invalid token",
    statusCode: 400
}

export const TokenMismatch: IErrorResponse = {
    message: "Token mismatch",
    statusCode: 400
}

export const NotFound: IErrorResponse = {
    message: "Not found",
    statusCode: 404
}

export const UnsupportedFileType: IErrorResponse = {
    message: "Unsupported file type"
}

export const ProvideDocumentId: IErrorResponse = {
    message: "Please documentId",
    statusCode: 400
}
