export class TaskDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TaskDomainError";
    }
}

export class UnchangeableDueToStatusError extends TaskDomainError {
    constructor(status: string) {
        super(`Cannot change anything about this task since it's status is ${status}`);
        this.name = "UnchangeableDueToStatusError";
    }
}

export class CannotChangeCancelledError extends TaskDomainError {
    constructor() {
        super("Cannot change status for cancelled task");
        this.name = "CannotChangeStatuForCancelled";
    }
}

export class CannotChangeCompletedError extends TaskDomainError {
    constructor() {
        super("Cannot change status for completed task if it new status is 'IN_PROGRESS'");
        this.name = "CannotChangeStatusForCompleted";
    }
}
