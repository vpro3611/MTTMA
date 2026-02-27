
import express from "express";
import request from "supertest";
import { ChangeDescController,
    ChangeDescParamsSchema,
    ChangeDescBodySchema } from
        "../../../backend/src/modules/organization_task/controller/change_desc_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../backend/src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

describe("ChangeDescController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validTaskId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            changeDescS: jest.fn().mockResolvedValue({
                id: "task-1",
                description: "updated"
            })
        };

        const controller = new ChangeDescController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: "user-1" };
                next();
            });
        }

        app.patch(
            "/organizations/:orgId/tasks/:taskId/description",
            validate_params(ChangeDescParamsSchema),
            validateZodMiddleware(ChangeDescBodySchema),
            controller.changeDescCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service with correct DTO", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/description`)
            .send({ newDesc: "updated" });

        expect(res.status).toBe(200);

        expect(mockService.changeDescS).toHaveBeenCalledWith({
            newDesc: "updated",
            actorId: "user-1",
            orgTaskId: validTaskId,
            orgId: validOrgId,
        });
    });

    /**
     * ❌ Invalid body
     */
    it("should return 400 if body invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/description`)
            .send({ newDesc: "" }); // min(1) нарушен

        expect(res.status).toBe(400);
        expect(mockService.changeDescS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/bad/tasks/bad/description`)
            .send({ newDesc: "updated" });

        expect(res.status).toBe(400);
        expect(mockService.changeDescS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/description`)
            .send({ newDesc: "updated" });

        expect(res.status).toBe(401);
    });

});
