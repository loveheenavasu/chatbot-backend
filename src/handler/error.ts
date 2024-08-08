export interface ErrorResponse {
    message: string;
    statusCode?: number;
}

export const Unauthorized: ErrorResponse = {
    message: "You are not authorized to perform this action.",
    statusCode: 401
};

export const WrongPassword: ErrorResponse = {
    message: "The password you entered is incorrect. Please try again.",
    statusCode: 400
};


export const SomethingWentWrong: ErrorResponse = {
    message: "Something went wrong",
    statusCode: 400
}

export const RegisteredWithGoogle: ErrorResponse = {
    message: "You are registered with Google. Please log in with your Google account.",
    statusCode: 400
}

export const RegisteredWithPassword: ErrorResponse = {
    message: "You are registered using an email and password. Please log in using your password.",
    statusCode: 400
}

export const EmailNotRegistered: ErrorResponse = {
    message: "This email address is not registered with us. Please check and try again.",
    statusCode: 400
};

export const EmailAlreadyExists: ErrorResponse = {
    message: "This email address is already registered. Please use a different email or log in with the existing one.",
    statusCode: 400
};

export const WrongOtp: ErrorResponse = {
    message: "The OTP you entered is incorrect. Please try again.",
    statusCode: 400
};

export const ProvideToken: ErrorResponse = {
    message: "Please provide token",
    statusCode: 400
}

export const BearerToken: ErrorResponse = {
    message: "Not a bearer token",
    statusCode: 400
}

export const InvalidToken: ErrorResponse = {
    message: "Invalid token",
    statusCode: 401
}

export const TokenMismatch: ErrorResponse = {
    message: "Token mismatch",
    statusCode: 400
}

export const NotFound: ErrorResponse = {
    message: "Not found",
    statusCode: 404
}

export const UnsupportedFileType: ErrorResponse = {
    message: "Unsupported file type"
}

export const ProvideDocumentId: ErrorResponse = {
    message: "Please provide documentId",
    statusCode: 400
}
