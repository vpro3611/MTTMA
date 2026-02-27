import express from "express";
import request from "supertest";

import {
    ChangeRoleController,
    ChangeRoleBodySchema,
    ChangeRoleParamsSchema
} from "../../../backend/src/modules/organization_members/controllers/change_role_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../backend/src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

describe("ChangeRoleController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validTargetId = "550e8400-e29b-41d4-a716-446655440001";
    const validActorId = "550e8400-e29b-41d4-a716-446655440002";

    const setupApp = (withUser = true) => {

        mockService = {
            changeRoleS: jest.fn().mockResolvedValue({
                success: true
            })
        };

        const controller = new ChangeRoleController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.patch(
            "/organizations/:orgId/members/:targetUserId/role",
            validate_params(ChangeRoleParamsSchema),
            validateZodMiddleware(ChangeRoleBodySchema),
            controller.changeRoleCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service with correct dto", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/members/${validTargetId}/role`)
            .send({ role: "ADMIN" });

        expect(res.status).toBe(200);

        expect(mockService.changeRoleS).toHaveBeenCalledWith({
            actorUserId: validActorId,
            organizationId: validOrgId,
            targetUserId: validTargetId,
            role: "ADMIN",
        });
    });

    /**
     * ❌ Invalid body
     */
    it("should return 400 if body invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/members/${validTargetId}/role`)
            .send({ role: "" }); // пустая строка, если схема требует минимум

        expect(res.status).toBe(400);

        expect(mockService.changeRoleS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/bad-id/members/${validTargetId}/role`)
            .send({ role: "ADMIN" });

        expect(res.status).toBe(400);

        expect(mockService.changeRoleS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}/members/${validTargetId}/role`)
            .send({ role: "ADMIN" });

        expect(res.status).toBe(401);

        expect(mockService.changeRoleS).not.toHaveBeenCalled();
    });

});
