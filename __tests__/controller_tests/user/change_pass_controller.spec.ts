import express from "express";
import request from "supertest";
import { ChangePassController } from "../../../src/modules/user/controller/change_pass_controller.js";
import { errorMiddleware } from "../../../src/middlewares/error_middleware.js";

describe("ChangePassController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    beforeEach(() => {

        mockService = {
            changePassS: jest.fn().mockResolvedValue({
                id: "user-1",
                email: "updated@mail.com"
            })
        };

        const controller = new ChangePassController(mockService);

        app = express();
        app.use(express.json());

        // имитация middleware, который ставит req.user
        app.use((req: any, res, next) => {
            req.user = { sub: "user-1" };
            next();
        });

        app.put("/user/password", controller.changePassCont);
        app.use(errorMiddleware());
    });

    // ✅ Happy path #1
    it("should return 200 and updated user", async () => {

        const res = await request(app)
            .put("/user/password")
            .send({ old_pass: "old", new_pass: "new" });

        expect(res.status).toBe(200);
        expect(res.body.id).toBe("user-1");

        expect(mockService.changePassS)
            .toHaveBeenCalledWith("user-1", "old", "new");
    });

    // ✅ Happy path #2 (другие данные)
    it("should pass correct values to service", async () => {

        await request(app)
            .put("/user/password")
            .send({ old_pass: "123", new_pass: "456" });

        expect(mockService.changePassS)
            .toHaveBeenCalledWith("user-1", "123", "456");
    });

    //  Error case — нет req.user
    it("should return error if user not present", async () => {

        const controller = new ChangePassController(mockService);

        app = express();
        app.use(express.json());

        // НЕ добавляем middleware, который ставит req.user
        app.put("/user/password", controller.changePassCont);
        app.use(errorMiddleware());

        const res = await request(app)
            .put("/user/password")
            .send({ old_pass: "old", new_pass: "new" });

        // зависит от твоей иерархии ошибок
        expect(res.status).toBe(401);
    });

});
