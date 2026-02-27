import {ConflictError, InfrastructureError, NotFoundError} from "../../../errors_base/errors_base.js";


export class UserRepositoryError extends InfrastructureError {
    constructor(message: string) {
        super(message);
        this.name = "UserRepositoryError";
    }
}

export class UserPersistenceError extends InfrastructureError {
    constructor() {
        super("Failed to persist user");
        this.name = "UserPersistenceError";
    }
}

export class UserNotFound extends NotFoundError {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}

export class UserAlreadyExistsError extends ConflictError {
    constructor() {
        super("User with this email already exists");
        this.name = "UserAlreadyExistsError";
    }
}




