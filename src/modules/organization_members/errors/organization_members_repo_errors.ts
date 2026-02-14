import {InfrastructureError, NotFoundError} from "../../../errors_base/errors_base.js";


export class OrganizationMembersRepoError extends InfrastructureError {
    constructor(message: string) {
        super(message);
        this.name = "OrganizationMembersRepositoryError";
    }
}

export class OrganizationMemberAlreadyExistsError extends OrganizationMembersRepoError {
    constructor() {
        super("Organization member already exists");
        this.name = "OrganizationMemberAlreadyExistsError";
    }
}

export class OrganizationNotFoundError extends NotFoundError {
    constructor() {
        super("Organization not found");
        this.name = "OrganizationNotFoundError";
    }
}

export class UserNotFoundError extends NotFoundError {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}

export class OrganizationMemberPersistenceError extends OrganizationMembersRepoError {
    constructor() {
        super("Failed to persist organization member");
        this.name = "OrganizationMemberPersistenceError";
    }
}

export class OrganizationMemberNotFoundError extends NotFoundError {
    constructor() {
        super("Organization member not found");
        this.name = "OrganizationMemberNotFoundError";
    }
}