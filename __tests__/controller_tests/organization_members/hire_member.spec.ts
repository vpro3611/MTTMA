import express from "express";
import request from "supertest";

import {
    HireMemberController,
    HireMemberBodySchema,
    HireMemberParamsSchema
} from "../../../backend/src/modules/organization_members/controllers/hire_member_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../backend/src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

import { OrgMemsRole } from
        "../../../backend/src/modules/organization_members/domain/org_members_role.js";

describe("HireMemberController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validActorId = "550e8400-e29b-41d4-a716-446655440001";
    const validTargetId = "550e8400-e29b-41d4-a716-446655440002";

    const setupApp = (withUser = true) => {

        mockService = {
            hireMemberS: jest.fn().mockResolvedValue({
                success: true
            })
        };

        const controller = new HireMemberController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.post(
            "/organizations/:orgId/members",
            validate_params(HireMemberParamsSchema),
            validateZodMiddleware(HireMemberBodySchema),
            controller.hireMemberCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path with role
     */
    it("should hire member with role", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/members`)
            .send({
                targetUserId: validTargetId,
                role: OrgMemsRole.ADMIN
            });

        expect(res.status).toBe(201);

        expect(mockService.hireMemberS).toHaveBeenCalledWith({
            actorUserId: validActorId,
            organizationId: validOrgId,
            targetUserId: validTargetId,
            role: OrgMemsRole.ADMIN,
        });
    });

    /**
     * ✅ Happy path without role
     */
    it("should hire member without role (optional)", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/members`)
            .send({
                targetUserId: validTargetId
            });

        expect(res.status).toBe(201);

        expect(mockService.hireMemberS).toHaveBeenCalledWith({
            actorUserId: validActorId,
            organizationId: validOrgId,
            targetUserId: validTargetId,
            role: undefined,
        });
    });

    /**
     * ❌ Invalid body (bad uuid)
     */
    it("should return 400 if targetUserId invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/members`)
            .send({
                targetUserId: "bad-id"
            });

        expect(res.status).toBe(400);

        expect(mockService.hireMemberS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid role
     */
    it("should return 400 if role invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/members`)
            .send({
                targetUserId: validTargetId,
                role: "SUPER_ADMIN"
            });

        expect(res.status).toBe(400);

        expect(mockService.hireMemberS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if orgId invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/bad-id/members`)
            .send({
                targetUserId: validTargetId
            });

        expect(res.status).toBe(400);

        expect(mockService.hireMemberS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/members`)
            .send({
                targetUserId: validTargetId
            });

        expect(res.status).toBe(500);

        expect(mockService.hireMemberS).not.toHaveBeenCalled();
    });
});
