import {ConflictError} from "../../../errors_base/errors_base.js";


export class OrganizationApplicationError extends ConflictError {
    constructor(message: string) {
        super(message);
        this.name = "OrganizationApplicationError";
    }
}

export class CannotDeleteOrganizationError extends OrganizationApplicationError {
    constructor() {
        super("Cannot delete organization since it has members in it");
        this.name = "CannotDeleteOrganizationError";
    }
}