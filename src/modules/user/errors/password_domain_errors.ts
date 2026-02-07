
export class PasswordDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DomainError";
    }
}

export class InvalidPasswordError extends PasswordDomainError {
    constructor() {
        super("Invalid password");
        this.name = "InvalidPasswordError";
    }
}

export class TooShortPasswordError extends PasswordDomainError {
    constructor(charsCount: number) {
        super(`Password must be at least ${charsCount} characters long`);
        this.name = "TooShortPasswordError";
    }
}

export class TooLongPasswordError extends PasswordDomainError {
    constructor(charsCount: number) {
        super(`Password must be at most ${charsCount} characters long`);
        this.name = "TooLongPasswordError";
    }
}

export class PasswordDoesNotContainDigitError extends PasswordDomainError {
    constructor() {
        super("Password must contain at least one digit");
        this.name = "PasswordDoesNotContainDigitError";
    }
}

export class PasswordDoesNotContainUppercaseLetterError extends PasswordDomainError {
    constructor() {
        super("Password must contain at least one uppercase letter");
        this.name = "PasswordDoesNotContainUppercaseLetterError";
    }
}

export class PasswordDoesNotContainSpecialSymbolError extends PasswordDomainError {
    constructor() {
        super("Password must contain at least one special symbol");
        this.name = "PasswordDoesNotContainSpecialSymbolError";
    }
}