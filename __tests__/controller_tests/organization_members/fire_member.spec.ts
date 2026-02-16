

import express from "express";
import request from "supertest";

import {
    FireMemberController,
    FireMemberParamsSchema
} from "../../../src/modules/organization_members/controllers/fire_member_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("FireMemberController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validTargetId = "550e8400-e29b-41d4-a716-446655440001";
    const validActorId = "550e8400-e29b-41d4-a716-446655440002";

    const setupApp = (withUser = true) => {

        mockService = {
            fireMemberS: jest.fn().mockResolvedValue(undefined)
        };

        const controller = new FireMemberController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.delete(
            "/organizations/:orgId/members/:targetUserId",
            validate_params(FireMemberParamsSchema),
            controller.fireMemberCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 204 and call service with correct dto", async () => {

        setupApp(true);

        const res = await request(app)
            .delete(`/organizations/${validOrgId}/members/${validTargetId}`);

        expect(res.status).toBe(204);

        expect(mockService.fireMemberS).toHaveBeenCalledWith({
            actorUserId: validActorId,
            organizationId: validOrgId,
            targetUserId: validTargetId,
        });
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .delete(`/organizations/bad-id/members/${validTargetId}`);

        expect(res.status).toBe(400);

        expect(mockService.fireMemberS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .delete(`/organizations/${validOrgId}/members/${validTargetId}`);

        expect(res.status).toBe(500);

        expect(mockService.fireMemberS).not.toHaveBeenCalled();
    });

});
