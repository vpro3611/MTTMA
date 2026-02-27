import express from "express";
import request from "supertest";

import {
    DeleteTaskController,
    DeleteTaskParamsSchema
} from "../../../backend/src/modules/organization_task/controller/delete_task_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

describe("DeleteTaskController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validTaskId = "550e8400-e29b-41d4-a716-446655440001";
    const validUserId = "550e8400-e29b-41d4-a716-446655440002";

    const setupApp = (withUser = true) => {

        mockService = {
            deleteTaskS: jest.fn().mockResolvedValue(undefined)
        };

        const controller = new DeleteTaskController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validUserId };
                next();
            });
        }

        app.delete(
            "/organizations/:orgId/tasks/:orgTaskId",
            validate_params(DeleteTaskParamsSchema),
            controller.deleteTaskCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 204 and call service with correct DTO", async () => {

        setupApp(true);

        const res = await request(app)
            .delete(`/organizations/${validOrgId}/tasks/${validTaskId}`);

        expect(res.status).toBe(204);

        expect(mockService.deleteTaskS).toHaveBeenCalledWith({
            orgTaskId: validTaskId,
            orgId: validOrgId,
            actorId: validUserId,
        });
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .delete(`/organizations/bad/tasks/bad`);

        expect(res.status).toBe(400);
        expect(mockService.deleteTaskS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .delete(`/organizations/${validOrgId}/tasks/${validTaskId}`);

        expect(res.status).toBe(401);
    });

});
