import express from "express";
import request from "supertest";

import { ViewUserInvitationsController } from
        "../../../src/modules/invitations/controllers/view_user_invitations_controller.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("ViewUserInvitationsController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validActorId = "550e8400-e29b-41d4-a716-446655440000";

    const setupApp = (withUser = true) => {

        mockService = {
            viewUserInvitationsS: jest.fn().mockResolvedValue([
                { id: "inv-1", status: "PENDING" },
                { id: "inv-2", status: "ACCEPTED" }
            ])
        };

        const controller = new ViewUserInvitationsController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.get(
            "/users/me/invitations",
            controller.viewUserInvitationsCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service with actorId", async () => {

        setupApp(true);

        const res = await request(app)
            .get("/users/me/invitations");

        expect(res.status).toBe(200);

        expect(mockService.viewUserInvitationsS)
            .toHaveBeenCalledWith(validActorId);

        expect(res.body.length).toBe(2);
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .get("/users/me/invitations");

        expect(res.status).toBe(401);

        expect(mockService.viewUserInvitationsS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Service throws
     */
    it("should propagate error via errorMiddleware", async () => {

        setupApp(true);

        mockService.viewUserInvitationsS.mockRejectedValue(
            new Error("Something failed")
        );

        const res = await request(app)
            .get("/users/me/invitations");

        expect(res.status).toBe(500);
    });

});