import {ValidationError} from "../../../errors_base/errors_base.js";


export class TaskDescriptionError extends ValidationError {
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