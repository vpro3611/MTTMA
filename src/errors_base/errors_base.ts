export abstract class ValidationError extends Error {
     constructor(message: string) {
        super(message);
    }
}
export abstract class AuthenticationError extends Error {
     constructor(message: string) {
        super(message);
    }
}
export abstract class AuthorizationError extends Error {
     constructor(message: string) {
        super(message);
    }
}
export abstract class NotFoundError extends Error {
     constructor(message: string) {
        super(message);
    }
}
export abstract class ConflictError extends Error {
     constructor(message: string) {
        super(message);
    }
}
export abstract class InfrastructureError extends Error {
     constructor(message: string) {
        super(message);
    }
}
