import {NotFoundError, ValidationError} from "../../../errors_base/errors_base.js";

// export class OrgTaskApplicationError extends Error{
//     constructor(message: string) {
//         super(message);
//         this.name = "OrgTaskApplicationError";
//     }
// }

export class TaskNotFoundError extends NotFoundError {
    constructor() {
        super("Task not found");
        this.name = "TaskNotFoundError";
    }
}

export class InvalidTaskStatusError extends ValidationError {
    constructor(status: string) {
        super(`Invalid task status - ${status}`);
        this.name = "InvalidTaskStatusError";
    }
}