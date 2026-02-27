import express from "express";
import request from "supertest";

import {
    ViewOrganizationController,
    ViewOrganizationParamsSchema
} from "../../../backend/src/modules/organization/controllers/view_organization_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

describe("ViewOrganizationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validActorId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            viewOrganizationS: jest.fn().mockResolvedValue({
                id: validOrgId,
                name: "Test Org",
                createdAt: new Date(),
            })
        };

        const controller = new ViewOrganizationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validActorId };
                next();
            });
        }

        app.get(
            "/organizations/:orgId",
            validate_params(ViewOrganizationParamsSchema),
            controller.viewOrganizationCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service with correct args", async () => {

        setupApp(true);

        const res = await request(app)
            .get(`/organizations/${validOrgId}`);

        expect(res.status).toBe(200);

        expect(mockService.viewOrganizationS)
            .toHaveBeenCalledWith(validActorId, validOrgId);

        expect(res.body.id).toBe(validOrgId);
    });

    /**
     * ❌ Invalid orgId
     */
    it("should return 400 if orgId invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .get("/organizations/bad-id");

        expect(res.status).toBe(400);

        expect(mockService.viewOrganizationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user missing", async () => {

        setupApp(false);

        const res = await request(app)
            .get(`/organizations/${validOrgId}`);

        expect(res.status).toBe(401);

        expect(mockService.viewOrganizationS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Service throws
     */
    it("should propagate error via errorMiddleware", async () => {

        setupApp(true);

        mockService.viewOrganizationS.mockRejectedValue(
            new Error("Something failed")
        );

        const res = await request(app)
            .get(`/organizations/${validOrgId}`);

        expect(res.status).toBe(500);
    });

});