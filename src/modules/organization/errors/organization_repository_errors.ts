import {ConflictError, InfrastructureError, NotFoundError} from "../../../errors_base/errors_base.js";


export class OrganizationRepositoryError extends InfrastructureError {
    constructor(message: string) {
        super(message);
        this.name = "OrganizationRepositoryError";
    }
}

export class OrganizationAlreadyExistsError extends ConflictError {
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

export class OrganizationNotFoundError extends NotFoundError {
    constructor() {
        super("Organization not found");
        this.name = "OrganizationNotFoundError";
    }
}

export class ForeignKeyViolationError extends OrganizationRepositoryError {
    constructor() {
        super("Foreign key violation");
        this.name = "ForeignKeyViolationError";
    }
}