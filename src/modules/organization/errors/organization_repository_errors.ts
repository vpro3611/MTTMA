

export class OrganizationRepositoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrganizationRepositoryError";
    }
}

export class OrganizationAlreadyExistsError extends OrganizationRepositoryError {
    constructor() {
        super("Organization with this name already exists");
        this.name = "OrganizationAlreadyExistsError";
    }
}

export class OrganizationPersistenceError extends OrganizationRepositoryError {
    constructor() {
        super("Failed to persist organization");
        this.name = "OrganizationPersistenceError";
    }
}

export class OrganizationNotFoundError extends OrganizationRepositoryError {
    constructor() {
        super("Organization not found");
        this.name = "OrganizationNotFoundError";
    }
}