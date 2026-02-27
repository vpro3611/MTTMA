import {AuthenticationError} from "../errors_base/errors_base.js";


export class UserIdError extends AuthenticationError {
    constructor() {
        super("Unauthorized request for token");
        this.name = "UnauthorizedError";
    }
}