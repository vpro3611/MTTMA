import {AuthenticationError} from "../../../errors_base/errors_base.js";


export class LoginError extends AuthenticationError {
    constructor(message: string) {
        super(message);
        this.name = "LoginError";
    }
}

export class InvalidCredentialsError extends LoginError {
    constructor() {
        super("Invalid credentials");
        this.name = "InvalidCredentialsError";
    }
}
