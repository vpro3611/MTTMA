import {TaskDescriptionTooLongError, TaskDescriptionTooShortError} from "../errors/task_description_errors.js";


export class TaskDescription {
    private constructor(private readonly value: string) {}

    static create(desc: string) {
        const trimmedDesc = desc.trim();
        if (trimmedDesc.length > 500) throw new TaskDescriptionTooLongError(500);
        if (trimmedDesc.length < 1) throw new TaskDescriptionTooShortError(1);
        return new TaskDescription(trimmedDesc);
    }

    getValue(): string {
        return this.value;
    }
}