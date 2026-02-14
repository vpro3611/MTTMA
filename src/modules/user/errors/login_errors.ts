

export class LoginError extends Error {
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
