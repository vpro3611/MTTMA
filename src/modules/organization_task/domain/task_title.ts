import {TaskTitleTooLongError, TaskTitleTooShortError} from "../errors/task_title_errors.js";


export class TaskTitle {
    private constructor(private readonly value: string){}

    static create(title: string) {
        const trimmedTitle = title.trim();
        if (trimmedTitle.length < 1) throw new TaskTitleTooShortError(1);
        if (trimmedTitle.length > 255) throw new TaskTitleTooLongError(255);

        return new TaskTitle(trimmedTitle);
    }

    getValue(): string {
        return this.value;
    }
}