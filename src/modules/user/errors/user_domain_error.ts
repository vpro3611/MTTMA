

export class UserDomainError extends Error {
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
