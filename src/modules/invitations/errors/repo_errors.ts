import {ConflictError, InfrastructureError, ValidationError} from "../../../errors_base/errors_base.js";


export class UniqueConstraintError extends ConflictError {
    constructor() {
        super("Invitation already exists");
        this.name = "UniqueConstraintError";
    }
}

export class ForeignKeyError extends ValidationError {
    constructor() {
        super("Target user does not exist");
        this.name = "ForeignKeyError";
    }
}

export class DatabaseError extends InfrastructureError {
    constructor() {
        super("Internal Database error");
        this.name = "DatabaseError";
    }
}
