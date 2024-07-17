const WrongPassword = {
    message: "Sorry, you entered wrong password",
    statusCode:400
}

const EmailNotRegistered = {
    message: "Sorry, email is not registered with us",
    statusCode:400
}

const ProvideToken = {
    message: "Please provide token",
    statusCode:400
}

const BearerToken = {
    message: "Not a bearer token",
    statusCode: 400
}

const InvalidToken = {
    message: "Invalid token",
    statusCode: 400
}

const TokenMismatch = {
    message: "Token mismatch",
    statusCode:400
}

const NotFound = {
    message: "Not found",
    statusCode: 404
}

export {
    WrongPassword,
    EmailNotRegistered,
    ProvideToken,
    InvalidToken,
    TokenMismatch,
    BearerToken,
    NotFound
}