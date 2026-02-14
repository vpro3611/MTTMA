import express from "express";
import request from "supertest";
import { ChangeEmailController } from "../../../src/modules/user/controller/change_email_controller.js";
import { errorMiddleware } from "../../../src/middlewares/error_middleware.js";
import { UserIdError } from "../../../src/http_errors/user_id_error.js";

describe("ChangeEmailController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    beforeEach(() => {

        mockService = {
            changeEmailS: jest.fn().mockResolvedValue({
                id: "user-1",
                email: "updated@mail.com"
            })
        };

        const controller = new ChangeEmailController(mockService);

        app = express();
        app.use(express.json());

        // middleware, который имитирует req.user
        app.use((req: any, res, next) => {
            req.user = { sub: "user-1" };
            next();
        });

        app.put("/user/email", controller.changeEmailCont);
        app.use(errorMiddleware());
    });

    it("should return 200 and updated user", async () => {

        const res = await request(app)
            .put("/user/email")
            .send({ new_email: "updated@mail.com" });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe("updated@mail.com");

        expect(mockService.changeEmailS)
            .toHaveBeenCalledWith("user-1", "updated@mail.com");
    });

    it("should return 401 if user not present", async () => {

        app = express();
        app.use(express.json());

        const controller = new ChangeEmailController(mockService);

        app.put("/user/email", controller.changeEmailCont);
        app.use(errorMiddleware());

        const res = await request(app)
            .put("/user/email")
            .send({ new_email: "updated@mail.com" });

        expect(res.status).toBe(401); // зависит от твоего errorMiddleware
    });

});
