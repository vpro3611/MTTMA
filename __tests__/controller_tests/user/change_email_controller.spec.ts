import express from "express";
import request from "supertest";
import { ChangeEmailController, ChangeEmailSchema } from "../../../backend/src/modules/user/controller/change_email_controller.js";
import { errorMiddleware } from "../../../backend/src/middlewares/error_middleware.js";
import { validateZodMiddleware } from "../../../backend/src/middlewares/validate_zod_middleware.js";

describe("ChangeEmailController (HTTP integration with Zod)", () => {

    let app: express.Express;
    let mockService: any;

    const setupApp = (withUser = true) => {

        mockService = {
            changeEmailS: jest.fn().mockResolvedValue({
                id: "user-1",
                email: "updated@mail.com"
            })
        };

        const controller = new ChangeEmailController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: "user-1" };
                next();
            });
        }

        app.put(
            "/user/email",
            validateZodMiddleware(ChangeEmailSchema),
            controller.changeEmailCont
        );

        app.use(errorMiddleware());
    };

    /**
     *  Happy path
     */
    it("should return 200 and updated user", async () => {

        setupApp(true);

        const res = await request(app)
            .put("/user/email")
            .send({ new_email: "updated@mail.com" });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe("updated@mail.com");

        expect(mockService.changeEmailS)
            .toHaveBeenCalledWith("user-1", "updated@mail.com");
    });

    /**
     * Invalid email format
     */
    it("should return 400 if email format is invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .put("/user/email")
            .send({ new_email: "not-an-email" });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");

        expect(mockService.changeEmailS).not.toHaveBeenCalled();
    });

    /**
     *  Missing field
     */
    it("should return 400 if new_email is missing", async () => {

        setupApp(true);

        const res = await request(app)
            .put("/user/email")
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.code).toBe("VALIDATION_ERROR");

        expect(mockService.changeEmailS).not.toHaveBeenCalled();
    });

    /**
     *  Missing user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .put("/user/email")
            .send({ new_email: "updated@mail.com" });

        expect(res.status).toBe(401);
    });

});
