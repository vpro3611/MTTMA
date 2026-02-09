export class TaskTitleErrors extends Error{
    constructor(message: string) {
        super(message);
        this.name = "TaskTitleErrors";
    }
}

export class TaskTitleTooLongError extends TaskTitleErrors {
    constructor(charsCount: number) {
        super(`Task title must be at most ${charsCount} characters long`);
        this.name = "TaskTitleTooLongError";
    }
}

export class TaskTitleTooShortError extends TaskTitleErrors {
    constructor(charsCount: number) {
        super(`Task title must be at least ${charsCount} characters long`);
        this.name = "TaskTitleTooShortError";
    }
}