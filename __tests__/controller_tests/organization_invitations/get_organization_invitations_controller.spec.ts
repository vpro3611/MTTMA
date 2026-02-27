import express from "express";
import request from "supertest";

import {
    GetOrganizationInvitationsController,
    GetOrganizationInvitationsParamsSchema,
    invitationFiltersQuerySchema
} from "../../../backend/src/modules/invitations/controllers/get_organization_invitations_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

import { InvitationStatus } from
        "../../../backend/src/modules/invitations/domain/invitation_status.js";

describe("GetOrganizationInvitationsController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validActorId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            getOrganizationInvitationsS: jest.fn().mockResolvedValue([])
        };

        const controller = new GetOrganizationInvitationsController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.get(
            "/organizations/:orgId/invitations",
            validate_params(GetOrganizationInvitationsParamsSchema),
            controller.getOrganizationInvitationsCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path with filters
     */
    it("should return 200 and call service with parsed filters", async () => {

        setupApp(true);

        const res = await request(app)
            .get(`/organizations/${validOrgId}/invitations`)
            .query({
                status: InvitationStatus.PENDING,
                createdFrom: "2024-01-01",
                createdTo: "2024-12-31",
            });

        expect(res.status).toBe(200);

        expect(mockService.getOrganizationInvitationsS)
            .toHaveBeenCalledTimes(1);

        const callArgs = mockService.getOrganizationInvitationsS.mock.calls[0];

        expect(callArgs[0]).toBe(validActorId);
        expect(callArgs[1]).toBe(validOrgId);

        expect(callArgs[2].status).toBe(InvitationStatus.PENDING);
        expect(callArgs[2].createdFrom).toBeInstanceOf(Date);
        expect(callArgs[2].createdTo).toBeInstanceOf(Date);
    });

    /**
     * ❌ Invalid orgId
     */
    it("should return 400 if orgId invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .get(`/organizations/bad-id/invitations`);

        expect(res.status).toBe(400);
        expect(mockService.getOrganizationInvitationsS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid status
     */
    it("should return 400 if status invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .get(`/organizations/${validOrgId}/invitations`)
            .query({ status: "BAD_STATUS" });

        expect(res.status).toBe(400);
    });

    /**
     * ❌ Invalid invited_user_id
     */
    it("should return 400 if invited_user_id not uuid", async () => {

        setupApp(true);

        const res = await request(app)
            .get(`/organizations/${validOrgId}/invitations`)
            .query({ invited_user_id: "bad-id" });

        expect(res.status).toBe(400);
    });

    /**
     * ❌ Invalid createdFrom
     */
    it("should return 400 if createdFrom invalid date", async () => {

        setupApp(true);

        const res = await request(app)
            .get(`/organizations/${validOrgId}/invitations`)
            .query({ createdFrom: "not-a-date" });

        expect(res.status).toBe(400);
    });

    /**
     * ❌ createdFrom > createdTo
     */
    it("should return 400 if createdFrom after createdTo", async () => {

        setupApp(true);

        const res = await request(app)
            .get(`/organizations/${validOrgId}/invitations`)
            .query({
                createdFrom: "2024-12-31",
                createdTo: "2024-01-01",
            });

        expect(res.status).toBe(400);
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .get(`/organizations/${validOrgId}/invitations`);

        expect(res.status).toBe(401);
    });

});