import {NextFunction, Request, Response} from "express";

import {
    AuthenticationError,
    AuthorizationError,
    ConflictError, InfrastructureError,
    NotFoundError,
    ValidationError
} from "../errors_base/errors_base.js";


export const errorMiddleware = () => {
    return (err: unknown, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ValidationError) {
            return res.status(400).json(
                {
                    code: "VALIDATION_ERROR",
                    message: err.message,
                }
            );
        }
        if (err instanceof AuthenticationError) {
            return res.status(401).json(
                {
                    code: "AUTHENTICATION_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof AuthorizationError) {
            return res.status(403).json(
                {
                    code: "AUTHORIZATION_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof NotFoundError) {
            return res.status(404).json(
                {
                    code: "NOT_FOUND_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof ConflictError) {
            return res.status(409).json(
                {
                    code: "CONFLICT_ERROR",
                    message: err.message
                }
            );
        }
        if (err instanceof InfrastructureError) {
            return res.status(500).json(
                {
                    code: "INFRASTRUCTURE_ERROR",
                    message: err.message
                }
            );
        }

        console.error("Unhandled error: ", err);

        return res.status(500).json(
            {
                code: "INTERNAL_SERVER_ERROR",
                message: "Unexpected error. Please try again later.",
            }
        );
    }

}
