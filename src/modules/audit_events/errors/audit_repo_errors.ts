import {InfrastructureError, NotFoundError} from "../../../errors_base/errors_base.js";

export class AuditRepoError extends InfrastructureError {
    constructor(message: string) {
        super(message);
        this.name = "AuditRepoError";
    }
}

export class AuditPersistenceError extends AuditRepoError {
    constructor() {
        super("Failed to persist audit event");
        this.name = "AuditPersistenceError";
    }
}

export class AuditNotFoundError extends NotFoundError {
    constructor() {
        super("Audit event not found");
        this.name = "AuditNotFoundError";
    }
}