import express from "express";
import request from "supertest";
import { errorMiddleware } from "../../src/middlewares/error_middleware.js";

import {
    TestValidationError,
    TestAuthenticationError,
    TestAuthorizationError,
    TestNotFoundError,
    TestConflictError,
    TestInfrastructureError
} from "../../src/test_errors.js";

describe("errorMiddleware (HTTP integration)", () => {

    let app: express.Express;

    beforeEach(() => {

        app = express();

        app.get("/validation", () => {
            throw new TestValidationError("Invalid input");
        });

        app.get("/auth", () => {
            throw new TestAuthenticationError("Invalid credentials");
        });

        app.get("/forbidden", () => {
            throw new TestAuthorizationError("Forbidden");
        });

        app.get("/notfound", () => {
            throw new TestNotFoundError("Not found");
        });

        app.get("/conflict", () => {
            throw new TestConflictError("Conflict");
        });

        app.get("/infra", () => {
            throw new TestInfrastructureError("Database down");
        });

        app.get("/unknown", () => {
            throw new Error("Something weird");
        });

        app.use(errorMiddleware());
    });

    it("should handle ValidationError", async () => {
        const res = await request(app).get("/validation");

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            code: "VALIDATION_ERROR",
            message: "Invalid input",
        });
    });

    it("should handle AuthenticationError", async () => {
        const res = await request(app).get("/auth");

        expect(res.status).toBe(401);
        expect(res.body.code).toBe("AUTHENTICATION_ERROR");
    });

    it("should handle AuthorizationError", async () => {
        const res = await request(app).get("/forbidden");

        expect(res.status).toBe(403);
        expect(res.body.code).toBe("AUTHORIZATION_ERROR");
    });

    it("should handle NotFoundError", async () => {
        const res = await request(app).get("/notfound");

        expect(res.status).toBe(404);
        expect(res.body.code).toBe("NOT_FOUND_ERROR");
    });

    it("should handle ConflictError", async () => {
        const res = await request(app).get("/conflict");

        expect(res.status).toBe(409);
        expect(res.body.code).toBe("CONFLICT_ERROR");
    });

    it("should handle InfrastructureError", async () => {
        const res = await request(app).get("/infra");

        expect(res.status).toBe(500);
        expect(res.body.code).toBe("INFRASTRUCTURE_ERROR");
    });

    it("should handle unknown errors", async () => {
        const res = await request(app).get("/unknown");

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected error. Please try again later.",
        });
    });

});
