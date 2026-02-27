import express from "express";
import request from "supertest";

import {
    AcceptInvitationController,
    AcceptInvitationParamsSchema
} from "../../../backend/src/modules/invitations/controllers/accept_invitation_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

describe("AcceptInvitationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validInvitationId = "550e8400-e29b-41d4-a716-446655440000";
    const validActorId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            acceptInvitationS: jest.fn().mockResolvedValue({
                id: validInvitationId,
                organizationId: "org-1",
                invitedUserId: validActorId,
                invitedByUserId: "owner-1",
                role: "MEMBER",
                status: "ACCEPTED",
                createdAt: new Date(),
                expiredAt: new Date(),
            })
        };

        const controller = new AcceptInvitationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.post(
            "/invitations/:invitationId/accept",
            validate_params(AcceptInvitationParamsSchema),
            controller.acceptInvitationCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service correctly", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/accept`);

        expect(res.status).toBe(200);

        expect(mockService.acceptInvitationS)
            .toHaveBeenCalledWith(validActorId, validInvitationId);

        expect(res.body.status).toBe("ACCEPTED");
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if invitationId invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/invitations/bad-id/accept`);

        expect(res.status).toBe(400);

        expect(mockService.acceptInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/accept`);

        expect(res.status).toBe(401);

        expect(mockService.acceptInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Service throws
     */
    it("should propagate error from service via errorMiddleware", async () => {

        setupApp(true);

        mockService.acceptInvitationS.mockRejectedValue(
            new Error("Something failed")
        );

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/accept`);

        expect(res.status).toBe(500);
    });

});