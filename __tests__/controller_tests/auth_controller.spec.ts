import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { AuthController } from "../../src/Auth/auth_controller/auth_controller.js";
import { MissingRefreshTokenError } from "../../src/http_errors/token_errors.js";
import {errorMiddleware} from "../../src/middlewares/error_middleware.js";

describe("AuthController (HTTP integration)", () => {

    let app: express.Express;
    let authService: any;

    beforeEach(() => {

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

        app.post("/pub/register", controller.register);
        app.post("/pub/login", controller.login);
        app.post("/pub/refresh", controller.refresh);
        app.post("/pub/logout", controller.logout);

        app.use(errorMiddleware());
        process.env.NODE_ENV = "test";
    });

    /**
     * REFRESH
     */
    it("POST /auth/refresh should refresh tokens and set cookie", async () => {

        authService.refresh.mockResolvedValue({
            accessToken: "new-access",
            refreshToken: "new-refresh",
        });

        const res = await request(app)
            .post("/pub/refresh")
            .set("Cookie", ["refreshToken=old-refresh"]);

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBe("new-access");

        expect(res.headers["set-cookie"]).toBeDefined();
        expect(res.headers["set-cookie"][0]).toContain("refreshToken=new-refresh");
    });

    it("POST /auth/refresh should return 500 if token missing", async () => {

        const res = await request(app)
            .post("/pub/refresh");

        expect(res.status).toBe(401);

    });

    /**
     * REGISTER
     */
    it("POST /auth/register should register and set cookie", async () => {

        authService.register.mockResolvedValue({
            accessToken: "access",
            refreshToken: "refresh",
            user: { id: "user-1" },
        });

        const res = await request(app)
            .post("/pub/register")
            .send({
                email: "test@test.com",
                password: "password",
            });

        expect(res.status).toBe(201);
        expect(res.body.accessToken).toBe("access");
        expect(res.body.user.id).toBe("user-1");

        expect(res.headers["set-cookie"]).toBeDefined();
    });

    /**
     * LOGIN
     */
    it("POST /auth/login should login and set cookie", async () => {

        authService.login.mockResolvedValue({
            accessToken: "access",
            refreshToken: "refresh",
            user: { id: "user-2" },
        });

        const res = await request(app)
            .post("/pub/login")
            .send({
                email: "login@test.com",
                password: "password",
            });

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBe("access");
        expect(res.body.user.id).toBe("user-2");

        expect(res.headers["set-cookie"]).toBeDefined();
    });

    /**
     * LOGOUT
     */
    it("POST /auth/logout should clear cookie and return 204", async () => {

        const res = await request(app)
            .post("/pub/logout")
            .set("Cookie", ["refreshToken=refresh"]);

        expect(res.status).toBe(204);
    });
});
