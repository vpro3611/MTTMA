

export class EmailDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DomainError";
    }
}


export class TooShortEmail extends EmailDomainError {
    constructor(charsCount: number) {
        super(`Email must be at least ${charsCount} characters long`);
        this.name = "TooShortEmail";
    }
}

export class TooLongEmail extends EmailDomainError {
    constructor(charsCount: number) {
        super(`Email must be at most ${charsCount} characters long`);
        this.name = "TooLongEmail";
    }
}

export class InvalidEmailError extends EmailDomainError {
    constructor() {
        super("Invalid email format");
        this.name = "InvalidEmailError";
    }
}