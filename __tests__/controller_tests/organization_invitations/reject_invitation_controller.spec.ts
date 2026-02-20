import express from "express";
import request from "supertest";

import {
    RejectInvitationController,
    RejectInvitationParamsSchema
} from "../../../src/modules/invitations/controllers/reject_invitation_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("RejectInvitationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validInvitationId = "550e8400-e29b-41d4-a716-446655440000";
    const validActorId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            rejectInvitationS: jest.fn().mockResolvedValue({
                id: validInvitationId,
                organizationId: "org-1",
                invitedUserId: validActorId,
                invitedByUserId: "owner-1",
                role: "MEMBER",
                status: "REJECTED",
                createdAt: new Date(),
                expiredAt: new Date(),
            })
        };

        const controller = new RejectInvitationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.post(
            "/invitations/:invitationId/reject",
            validate_params(RejectInvitationParamsSchema),
            controller.rejectInvitationCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service correctly", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/reject`);

        expect(res.status).toBe(200);

        expect(mockService.rejectInvitationS)
            .toHaveBeenCalledWith(validActorId, validInvitationId);

        expect(res.body.status).toBe("REJECTED");
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if invitationId invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/invitations/bad-id/reject`);

        expect(res.status).toBe(400);

        expect(mockService.rejectInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/reject`);

        expect(res.status).toBe(401);

        expect(mockService.rejectInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Service throws
     */
    it("should propagate error from service via errorMiddleware", async () => {

        setupApp(true);

        mockService.rejectInvitationS.mockRejectedValue(
            new Error("Reject failed")
        );

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/reject`);

        expect(res.status).toBe(500);
    });

});