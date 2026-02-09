export class OrgTaskRepoError extends Error {
     constructor(message: string){
        super(message);
        this.name = "orgTaskRepoError";
    }
}


export class OrganizationDoesNotExistError extends OrgTaskRepoError {
    constructor() {
        super("Organization does not exist");
        this.name = "OrganizationDoesNotExistError";
    }
}

export class UserDoesNotExistError extends OrgTaskRepoError {
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
