import {TaskTitleTooLongError, TaskTitleTooShortError} from "../errors/task_title_errors.js";


export class TaskTitle {
    private constructor(private readonly value: string){}

    private static readonly MAX_LENGTH = 255;
    private static readonly MIN_LENGTH = 1;

    private static checkMaxLength(title: string) {
        if (title.length > this.MAX_LENGTH) throw new TaskTitleTooLongError(this.MAX_LENGTH);
    }

    private static checkMinLength(title: string) {
        if (title.length < this.MIN_LENGTH) throw new TaskTitleTooShortError(this.MIN_LENGTH);
    }

    static create(title: string) {
        const trimmedTitle = title.trim();
        TaskTitle.checkMaxLength(trimmedTitle);
        TaskTitle.checkMinLength(trimmedTitle);

        return new TaskTitle(trimmedTitle);
    }

    getValue(): string {
        return this.value;
    }
}