

export class TaskDescriptionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TaskDescriptionError";
    }
}

export class TaskDescriptionTooLongError extends TaskDescriptionError {
    constructor(charsCount: number) {
        super(`Task description must be at most ${charsCount} characters long`);
        this.name = "TaskDescriptionTooLongError";
    }
}

export class TaskDescriptionTooShortError extends TaskDescriptionError {
    constructor(charsCount: number) {
        super(`Task description must be at least ${charsCount} characters long`);
        this.name = "TaskDescriptionTooShortError";
    }
}