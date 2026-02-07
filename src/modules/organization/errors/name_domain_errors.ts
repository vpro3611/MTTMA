

export class NameDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NameDomainError";
    }
}

export class NameTooShortError extends NameDomainError {
    constructor(charCount: number) {
        super(`Name must be at least ${charCount} characters long`);
        this.name = "NameTooShortError";
    }
}

export class NameTooLongError extends NameDomainError {
    constructor(charCount: number) {
        super(`Name must be at most ${charCount} characters long`);
        this.name = "NameTooLongError";
    }
}

export class NameContainsForbiddenSymbols extends NameDomainError {
    constructor() {
        super("Name contains forbidden symbols");
        this.name = "NameContainsForbiddenSymbols";
    }
}