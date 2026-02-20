import express from "express";
import request from "supertest";

import {
    CancelInvitationController,
    CancelInvitationParamsSchema
} from "../../../src/modules/invitations/controllers/cancel_invitation_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("CancelInvitationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validInvitationId = "550e8400-e29b-41d4-a716-446655440000";
    const validActorId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            cancelInvitationS: jest.fn().mockResolvedValue({
                id: validInvitationId,
                organizationId: "org-1",
                invitedUserId: "user-2",
                invitedByUserId: validActorId,
                role: "MEMBER",
                status: "CANCELED",
                createdAt: new Date(),
                expiredAt: new Date(),
            })
        };

        const controller = new CancelInvitationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.post(
            "/invitations/:invitationId/cancel",
            validate_params(CancelInvitationParamsSchema),
            controller.cancelInvitationCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service correctly", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/cancel`);

        expect(res.status).toBe(200);

        expect(mockService.cancelInvitationS)
            .toHaveBeenCalledWith(validActorId, validInvitationId);

        expect(res.body.status).toBe("CANCELED");
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if invitationId invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/invitations/bad-id/cancel`);

        expect(res.status).toBe(400);

        expect(mockService.cancelInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/cancel`);

        expect(res.status).toBe(401);

        expect(mockService.cancelInvitationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Service throws
     */
    it("should propagate service error via errorMiddleware", async () => {

        setupApp(true);

        mockService.cancelInvitationS.mockRejectedValue(
            new Error("Cancel failed")
        );

        const res = await request(app)
            .post(`/invitations/${validInvitationId}/cancel`);

        expect(res.status).toBe(500);
    });

});