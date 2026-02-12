

export class OrganizationApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrganizationApplicationError";
    }
}

export class CannotDeleteOrganizationError extends OrganizationApplicationError {
    constructor() {
        super("Cannot delete organization it it has members in it");
        this.name = "CannotDeleteOrganizationError";
    }
}