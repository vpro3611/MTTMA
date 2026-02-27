import express from "express";
import request from "supertest";

import {
    DeleteOrganizationController,
    DeleteOrganizationParamsSchema
} from "../../../backend/src/modules/organization/controllers/delete_organization_controller.js";

import { validate_params } from
        "../../../backend/src/middlewares/validate_params.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

describe("DeleteOrganizationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validUserId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            deleteOrgS: jest.fn().mockResolvedValue(undefined)
        };

        const controller = new DeleteOrganizationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validUserId };
                next();
            });
        }

        app.delete(
            "/organizations/:orgId",
            validate_params(DeleteOrganizationParamsSchema),
            controller.DeleteOrganizationCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 204 and call service", async () => {

        setupApp(true);

        const res = await request(app)
            .delete(`/organizations/${validOrgId}`);

        expect(res.status).toBe(204);

        expect(mockService.deleteOrgS)
            .toHaveBeenCalledWith(validOrgId, validUserId);
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .delete(`/organizations/bad-id`);

        expect(res.status).toBe(400);

        expect(mockService.deleteOrgS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .delete(`/organizations/${validOrgId}`);

        expect(res.status).toBe(401);

        expect(mockService.deleteOrgS).not.toHaveBeenCalled();
    });

});
