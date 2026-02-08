

export class OrganizationMembersRepoError extends Error {
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

export class OrganizationNotFoundError extends OrganizationMembersRepoError {
    constructor() {
        super("Organization not found");
        this.name = "OrganizationNotFoundError";
    }
}

export class UserNotFoundError extends OrganizationMembersRepoError {
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

export class OrganizationMemberNotFoundError extends OrganizationMembersRepoError {
    constructor() {
        super("Organization member not found");
        this.name = "OrganizationMemberNotFoundError";
    }
}