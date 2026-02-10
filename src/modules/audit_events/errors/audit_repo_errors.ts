
export class AuditRepoError extends Error {
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

