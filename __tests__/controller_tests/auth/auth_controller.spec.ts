import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { AuthController } from "../../../src/Auth/auth_controller/auth_controller.js";
import { errorMiddleware } from "../../../src/middlewares/error_middleware.js";
import { validateZodMiddleware } from "../../../src/middlewares/validate_zod_middleware.js";
import { RegisterSchema, LoginSchema } from "../../../src/Auth/auth_controller/auth_controller.js";

describe("AuthController (HTTP integration with Zod)", () => {

    let app: express.Express;
    let authService: any;

    const setupApp = () => {

        authService = {
            refresh: jest.fn(),
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
        };

        const controller = new AuthController(authService);

        app = express();
        app.use(express.json());
        app.use(cookieParser());

        app.post(
            "/pub/register",
            validateZodMiddleware(RegisterSchema),
            controller.register
        );

        app.post(
            "/pub/login",
            validateZodMiddleware(LoginSchema),
            controller.login
        );

        app.post("/pub/refresh", controller.refresh);
        app.post("/pub/logout", controller.logout);

        app.use(errorMiddleware());

        process.env.NODE_ENV = "test";
    };

    beforeEach(() => {
        setupApp();
    });

    /**
     * REFRESH
     */
    it("POST /refresh should refresh tokens and set cookie", async () => {

        authService.refresh.mockResolvedValue({
            accessToken: "new-access",
            refreshToken: "new-refresh",
        });

        const res = await request(app)
            .post("/pub/refresh")
            .set("Cookie", ["refreshToken=old-refresh"]);

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBe("new-access");
        expect(res.headers["set-cookie"][0]).toContain("refreshToken=new-refresh");
    });

    it("POST /refresh should return 401 if token missing", async () => {

        const res = await request(app)
            .post("/pub/refresh");

        expect(res.status).toBe(401);
    });

    /**
     * REGISTER
     */
    it("POST /register should register and set cookie", async () => {

        authService.register.mockResolvedValue({
            accessToken: "access",
            refreshToken: "refresh",
            user: { id: "user-1" },
        });

        const res = await request(app)
            .post("/pub/register")
            .send({
                email: "test@test.com",
                password: "validpassword123",
            });

        expect(res.status).toBe(201);
        expect(res.body.accessToken).toBe("access");
        expect(res.body.user.id).toBe("user-1");
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("POST /register should return 400 for invalid email", async () => {

        const res = await request(app)
            .post("/pub/register")
            .send({
                email: "invalid",
                password: "validpassword123",
            });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");
        expect(authService.register).not.toHaveBeenCalled();
    });

    it("POST /register should return 400 for short password", async () => {

        const res = await request(app)
            .post("/pub/register")
            .send({
                email: "test@test.com",
                password: "short",
            });

        expect(res.status).toBe(400);
        expect(authService.register).not.toHaveBeenCalled();
    });

    /**
     * LOGIN
     */
    it("POST /login should login and set cookie", async () => {

        authService.login.mockResolvedValue({
            accessToken: "access",
            refreshToken: "refresh",
            user: { id: "user-2" },
        });

        const res = await request(app)
            .post("/pub/login")
            .send({
                email: "login@test.com",
                password: "validpassword123",
            });

        expect(res.status).toBe(200);
        expect(res.body.user.id).toBe("user-2");
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("POST /login should return 400 for invalid payload", async () => {

        const res = await request(app)
            .post("/pub/login")
            .send({
                email: "bad",
                password: "short",
            });

        expect(res.status).toBe(400);
        expect(authService.login).not.toHaveBeenCalled();
    });

    /**
     * LOGOUT
     */
    it("POST /logout should clear cookie and return 204", async () => {

        const res = await request(app)
            .post("/pub/logout")
            .set("Cookie", ["refreshToken=refresh"]);

        expect(res.status).toBe(204);
    });

});
