import express from "express";
import request from "supertest";
import { ChangePassController, ChangePassSchema } from "../../../backend/src/modules/user/controller/change_pass_controller.js";
import { errorMiddleware } from "../../../backend/src/middlewares/error_middleware.js";
import { validateZodMiddleware } from "../../../backend/src/middlewares/validate_zod_middleware.js";

describe("ChangePassController (HTTP integration with Zod)", () => {

    let app: express.Express;
    let mockService: any;

    const setupApp = (withUser = true) => {

        mockService = {
            changePassS: jest.fn().mockResolvedValue({
                id: "user-1",
                email: "updated@mail.com"
            })
        };

        const controller = new ChangePassController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: "user-1" };
                next();
            });
        }

        app.put(
            "/user/password",
            validateZodMiddleware(ChangePassSchema),
            controller.changePassCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and updated user", async () => {

        setupApp(true);

        const res = await request(app)
            .put("/user/password")
            .send({
                old_pass: "oldpassword123",
                new_pass: "newpassword123"
            });

        expect(res.status).toBe(200);
        expect(res.body.id).toBe("user-1");

        expect(mockService.changePassS)
            .toHaveBeenCalledWith(
                "user-1",
                "oldpassword123",
                "newpassword123"
            );
    });

    /**
     * ❌ Too short password
     */
    it("should return 400 if password is too short", async () => {

        setupApp(true);

        const res = await request(app)
            .put("/user/password")
            .send({
                old_pass: "short",
                new_pass: "short"
            });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");

        expect(mockService.changePassS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Missing field
     */
    it("should return 400 if field is missing", async () => {

        setupApp(true);

        const res = await request(app)
            .put("/user/password")
            .send({
                old_pass: "oldpassword123"
            });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");

        expect(mockService.changePassS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .put("/user/password")
            .send({
                old_pass: "oldpassword123",
                new_pass: "newpassword123"
            });

        expect(res.status).toBe(401);
    });

});
