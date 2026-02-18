import express from "express";
import request from "supertest";

import {
    RenameOrganizationController,
    RenameOrgBodySchema,
    RenameOrgParamsSchema
} from "../../../src/modules/organization/controllers/rename_organization_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("RenameOrganizationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validUserId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            renameOrgS: jest.fn().mockResolvedValue({
                id: validOrgId,
                name: "New Name"
            })
        };

        const controller = new RenameOrganizationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validUserId };
                next();
            });
        }

        app.patch(
            "/organizations/:orgId",
            validate_params(RenameOrgParamsSchema),
            validateZodMiddleware(RenameOrgBodySchema),
            controller.renameOrgCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 200 and call service with correct args", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}`)
            .send({ newName: "New Name" });

        expect(res.status).toBe(200);

        expect(mockService.renameOrgS)
            .toHaveBeenCalledWith(
                validOrgId,
                "New Name",
                validUserId
            );
    });

    /**
     * ❌ Invalid body
     */
    it("should return 400 if body invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}`)
            .send({ newName: "a" }); // слишком короткое

        expect(res.status).toBe(400);

        expect(mockService.renameOrgS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .patch(`/organizations/bad-id`)
            .send({ newName: "New Name" });

        expect(res.status).toBe(400);

        expect(mockService.renameOrgS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .patch(`/organizations/${validOrgId}`)
            .send({ newName: "New Name" });

        expect(res.status).toBe(401);

        expect(mockService.renameOrgS).not.toHaveBeenCalled();
    });

});
