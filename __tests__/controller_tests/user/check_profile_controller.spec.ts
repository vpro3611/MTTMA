import express from "express";
import request from "supertest";
import { CheckProfileController } from "../../../backend/src/modules/user/controller/check_profile_controller.js";
import { errorMiddleware } from "../../../backend/src/middlewares/error_middleware.js";
import { UserIdError } from "../../../backend/src/http_errors/user_id_error.js";
import { validate_params } from "../../../backend/src/middlewares/validate_params.js";
import { CheckProfileParamsSchema } from "../../../backend/src/modules/user/controller/check_profile_controller.js";

describe("CheckProfileController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    beforeEach(() => {

        mockService = {
            checkProfileS: jest.fn().mockResolvedValue({
                id: "user-2",
                email: "target@mail.com",
                status: "ACTIVE",
                created_at: new Date(),
            })
        };

        const controller = new CheckProfileController(mockService);

        app = express();
        app.use(express.json());

        // имитация auth middleware
        app.use((req: any, _res, next) => {
            req.user = { sub: "actor-1" };
            next();
        });

        app.get(
            "/users/:targetUserId/profile",
            validate_params(CheckProfileParamsSchema),
            controller.checkProfileCont
        );

        app.use(errorMiddleware());
    });

    // ✅ Happy path
    it("should return 200 and profile data", async () => {

        const targetId = "550e8400-e29b-41d4-a716-446655440000";

        const res = await request(app)
            .get(`/users/${targetId}/profile`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe("user-2");

        expect(mockService.checkProfileS)
            .toHaveBeenCalledWith("actor-1", targetId);
    });

    // ❌ Нет req.user
    it("should return 401 if user not present", async () => {

        const controller = new CheckProfileController(mockService);

        app = express();
        app.use(express.json());

        app.get(
            "/users/:targetUserId/profile",
            validate_params(CheckProfileParamsSchema),
            controller.checkProfileCont
        );

        app.use(errorMiddleware());

        const res = await request(app)
            .get("/users/550e8400-e29b-41d4-a716-446655440000/profile");

        expect(res.status).toBe(401);
    });

    // ❌ Невалидный UUID
    it("should return 400 for invalid UUID", async () => {

        const res = await request(app)
            .get("/users/not-a-uuid/profile");

        expect(res.status).toBe(400);
    });

    // ❌ Сервис кидает ошибку
    it("should propagate service error", async () => {

        mockService.checkProfileS.mockRejectedValue(
            new Error("service failed")
        );

        const res = await request(app)
            .get("/users/550e8400-e29b-41d4-a716-446655440000/profile");

        expect(res.status).toBeGreaterThanOrEqual(400);
    });

});
