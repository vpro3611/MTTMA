import express from "express";
import request from "supertest";

import {
    CreateInvitationController,
    CreateInvitationParamsSchema,
    CreateInvitationBodySchema
} from "../../../src/modules/invitations/controllers/create_invitation_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

import { OrgMemsRole } from
        "../../../src/modules/organization_members/domain/org_members_role.js";

describe("CreateInvitationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validInvitedId = "550e8400-e29b-41d4-a716-446655440001";
    const validActorId = "550e8400-e29b-41d4-a716-446655440002";

    const setupApp = (withUser = true) => {

        mockService = {
            createInvitationS: jest.fn().mockResolvedValue({
                id: "inv-1",
                organizationId: validOrgId,
                invitedUserId: validInvitedId,
                invitedByUserId: validActorId,
                role: OrgMemsRole.MEMBER,
                status: "PENDING",
                createdAt: new Date(),
                expiredAt: new Date(),
            })
        };

        const controller = new CreateInvitationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.post(
            "/organizations/:orgId/invitations/:invitedUserId",
            validate_params(CreateInvitationParamsSchema),
            validateZodMiddleware(CreateInvitationBodySchema),
            controller.createInvitationCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 201 and call service with correct dto", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/invitations/${validInvitedId}`)
            .send({ role: OrgMemsRole.MEMBER });

        expect(res.status).toBe(201);

        expect(mockService.createInvitationS).toHaveBeenCalledWith({
            actorId: validActorId,
            organizationId: validOrgId,
            invitedUserId: validInvitedId,
            role: OrgMemsRole.MEMBER,
        });
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/bad-id/invitations/${validInvitedId}`)
            .send({ role: OrgMemsRole.MEMBER });

        expect(res.status).toBe(400);
        expect(mockService.createInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid body
     */
    it("should return 400 if role invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/invitations/${validInvitedId}`)
            .send({ role: "BAD_ROLE" });

        expect(res.status).toBe(400);
        expect(mockService.createInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/invitations/${validInvitedId}`)
            .send({ role: OrgMemsRole.MEMBER });

        expect(res.status).toBe(401);
        expect(mockService.createInvitationS).not.toHaveBeenCalled();
    });

});