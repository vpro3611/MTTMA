

export class UserRepositoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UserRepositoryError";
    }
}

export class UserNotFound extends UserRepositoryError {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}

export class UserAlreadyExistsError extends UserRepositoryError {
    constructor() {
        super("User with this email already exists");
        this.name = "UserAlreadyExistsError";
    }
}

export class UserPersistenceError extends UserRepositoryError {
    constructor() {
        super("Failed to persist user");
        this.name = "UserPersistenceError";
    }
}


