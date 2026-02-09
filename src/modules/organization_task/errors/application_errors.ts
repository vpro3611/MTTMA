export class OrgTaskApplicationError extends Error{
    constructor(message: string) {
        super(message);
        this.name = "OrgTaskApplicationError";
    }
}

export class TaskNotFoundError extends OrgTaskApplicationError {
    constructor() {
        super("Task not found");
        this.name = "TaskNotFoundError";
    }
}

export class InvalidTaskStatusError extends OrgTaskApplicationError {
    constructor(status: string) {
        super(`Invalid task status - ${status}`);
        this.name = "InvalidTaskStatusError";
    }
}