

export class RepositoryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RepositoryError";
    }
}

export class UniqueConstraintError extends RepositoryError {
    constructor() {
        super("Unique constraint violation");
        this.name = "UniqueConstraintError";
    }
}

export class ForeignKeyError extends RepositoryError {
    constructor() {
        super("Foreign key error");
        this.name = "ForeignKeyError";
    }
}

export class DatabaseError extends RepositoryError {
    constructor() {
        super("Database error");
        this.name = "DatabaseError";
    }
}
