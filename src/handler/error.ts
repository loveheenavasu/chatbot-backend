export interface IErrorResponse {
    message: string;
    statusCode?: number;
}

export const Unauthorized: IErrorResponse = {
    message: "You are not authorized to perform this action.",
    statusCode: 401
};

export const WrongPassword: IErrorResponse = {
    message: "The password you entered is incorrect. Please try again.",
    statusCode: 400
};


export const SomethingWentWrong: IErrorResponse = {
    message: "Something went wrong",
    statusCode: 400
}

export const RegisteredWithGoogle: IErrorResponse = {
    message: "You are registered with Google. Please log in with your Google account.",
    statusCode: 400
}

export const RegisteredWithPassword: IErrorResponse = {
    message: "You are registered using an email and password. Please log in using your password.",
    statusCode: 400
}


export const EmailNotRegistered: IErrorResponse = {
    message: "This email address is not registered with us. Please check and try again.",
    statusCode: 400
};

export const EmailAlreadyExists: IErrorResponse = {
    message: "This email address is already registered. Please use a different email or log in with the existing one.",
    statusCode: 400
};

export const WrongOtp: IErrorResponse = {
    message: "The OTP you entered is incorrect. Please try again.",
    statusCode: 400
};

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
    message: "Please provide documentId",
    statusCode: 400
}
