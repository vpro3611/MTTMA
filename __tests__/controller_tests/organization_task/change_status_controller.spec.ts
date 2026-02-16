import express from "express";
import request from "supertest";

import {
    ChangeStatusController,
    ChangeStatusParamsSchema,
    ChangeStatusBodySchema
} from "../../../src/modules/organization_task/controller/change_status_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("ChangeStatusController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validTaskId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            changeStatusS: jest.fn().mockResolvedValue({
                id: "task-1",
                status: "DONE"
            })
        };

        const controller = new ChangeStatusController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: "user-1" };
                next();
            });
        }

        app.patch(
            "/organizations/:orgId/tasks/:taskId/status",
            validate_params(ChangeStatusParamsSchema),
            validateZodMiddleware(ChangeStatusBodySchema),
            controller.changeStatusCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service with correct DTO", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/status`)
            .send({ newStatus: "DONE" });

        expect(res.status).toBe(200);

        expect(mockService.changeStatusS).toHaveBeenCalledWith({
            newStatus: "DONE",
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
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/status`)
            .send({}); // отсутствует newStatus

        expect(res.status).toBe(400);
        expect(mockService.changeStatusS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/bad/tasks/bad/status`)
            .send({ newStatus: "DONE" });

        expect(res.status).toBe(400);
        expect(mockService.changeStatusS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/status`)
            .send({ newStatus: "DONE" });

        expect(res.status).toBe(401);
    });

});
