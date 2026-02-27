import {
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    InfrastructureError,
    NotFoundError, ValidationError
} from "./errors_base/errors_base.js";

export class TestValidationError extends ValidationError {}
export class TestAuthenticationError extends AuthenticationError {}
export class TestAuthorizationError extends AuthorizationError {}
export class TestNotFoundError extends NotFoundError {}
export class TestConflictError extends ConflictError {}
export class TestInfrastructureError extends InfrastructureError {}
