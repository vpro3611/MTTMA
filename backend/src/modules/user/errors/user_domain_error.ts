import {AuthorizationError} from "../../../errors_base/errors_base.js";


export class UserDomainError extends AuthorizationError {
    constructor(message: string) {
        super(message);
        this.name = "DomainError";
    }
}

export class UserIsBannedError extends UserDomainError {
    constructor() {
        super("User is banned");
        this.name = "UserIsBannedError";
    }
}
