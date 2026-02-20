import {InfrastructureError, NotFoundError} from "../../../errors_base/errors_base.js";

export class OrgTaskRepoError extends InfrastructureError {
     constructor(message: string){
        super(message);
        this.name = "orgTaskRepoError";
    }
}


export class OrganizationDoesNotExistError extends NotFoundError {
    constructor() {
        super("Organization does not exist");
        this.name = "OrganizationDoesNotExistError";
    }
}

export class UserDoesNotExistError extends NotFoundError {
    constructor() {
        super("User does not exist");
        this.name = "UserDoesNotExistError";
    }
}

export class TaskPersistenceError extends OrgTaskRepoError {
    constructor() {
        super("Failed to persist task");
        this.name = "TaskPersistenceError";
    }
}
