import {AuthenticationError} from "../errors_base/errors_base.js";


export class MissingRefreshTokenError extends AuthenticationError {
    constructor() {
        super("No refresh token provided");
        this.name = "MissingRefreshTokenError";
    }
}

export class InvalidRefreshTokenError extends AuthenticationError {
    constructor() {
        super("Invalid refresh token");
        this.name = "InvalidRefreshTokenError";
    }
}