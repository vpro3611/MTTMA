import {ConflictError, InfrastructureError, ValidationError} from "../../../errors_base/errors_base.js";


export class UniqueConstraintError extends ConflictError {
    constructor() {
        super("Resource conflict: unique constraint violation");
        this.name = "UniqueConstraintError";
    }
}

export class ForeignKeyError extends ValidationError {
    constructor() {
        super("Invalid reference: related entity does not exist");
        this.name = "ForeignKeyError";
    }
}

export class DatabaseError extends InfrastructureError {
    constructor() {
        super("Internal Database error");
        this.name = "DatabaseError";
    }
}
