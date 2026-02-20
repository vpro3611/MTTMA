import express from "express";
import request from "supertest";

import {
    ChangeTitleController,
    ChangeTitleParamsSchema,
    ChangeTitleBodySchema
} from "../../../src/modules/organization_task/controller/change_title_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("ChangeTitleController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validTaskId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            changeTitleS: jest.fn().mockResolvedValue({
                id: "task-1",
                title: "Updated title"
            })
        };

        const controller = new ChangeTitleController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: "user-1" };
                next();
            });
        }

        app.patch(
            "/organizations/:orgId/tasks/:taskId/title",
            validate_params(ChangeTitleParamsSchema),
            validateZodMiddleware(ChangeTitleBodySchema),
            controller.changeTitleCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service with correct DTO", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/title`)
            .send({ newTitle: "Updated title" });

        expect(res.status).toBe(200);

        expect(mockService.changeTitleS).toHaveBeenCalledWith({
            newTitle: "Updated title",
            actorId: "user-1",
            orgTaskId: validTaskId,
            orgId: validOrgId,
        });
    });

    /**
     * ❌ Invalid body (too short)
     */
    it("should return 400 if title invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/title`)
            .send({ newTitle: "" });

        expect(res.status).toBe(400);
        expect(mockService.changeTitleS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/bad/tasks/bad/title`)
            .send({ newTitle: "Updated title" });

        expect(res.status).toBe(400);
        expect(mockService.changeTitleS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/tasks/${validTaskId}/title`)
            .send({ newTitle: "Updated title" });

        expect(res.status).toBe(401);
    });

});
