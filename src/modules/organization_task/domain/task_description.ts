import {TaskDescriptionTooLongError, TaskDescriptionTooShortError} from "../errors/task_description_errors.js";


export class TaskDescription {
    private constructor(private readonly value: string) {}

    private static readonly MAX_LENGTH = 500;
    private static readonly MIN_LENGTH = 1;

    private static checkMaxLength(desc: string) {
        if (desc.length > this.MAX_LENGTH) throw new TaskDescriptionTooLongError(this.MAX_LENGTH);
    }

    private static checkMinLength(desc: string) {
        if (desc.length < this.MIN_LENGTH) throw new TaskDescriptionTooShortError(this.MIN_LENGTH);
    }

    static create(desc: string) {
        const trimmedDesc = desc.trim();
        TaskDescription.checkMaxLength(trimmedDesc);
        TaskDescription.checkMinLength(trimmedDesc);
        return new TaskDescription(trimmedDesc);
    }

    getValue(): string {
        return this.value;
    }
}