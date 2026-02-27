import express from "express";
import request from "supertest";

import {
    CreateOrganizationController,
    CreateOrgBodySchema
} from "../../../backend/src/modules/organization/controllers/create_organization_controller.js";

import { validateZodMiddleware } from
        "../../../backend/src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../backend/src/middlewares/error_middleware.js";

describe("CreateOrganizationController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validUserId = "550e8400-e29b-41d4-a716-446655440000";

    const setupApp = (withUser = true) => {

        mockService = {
            createOrgS: jest.fn().mockResolvedValue({
                id: "org-1",
                name: "Test Org"
            })
        };

        const controller = new CreateOrganizationController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validUserId };
                next();
            });
        }

        app.post(
            "/organizations",
            validateZodMiddleware(CreateOrgBodySchema),
            controller.createOrganizationCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path
     */
    it("should return 201 and call service with correct args", async () => {

        setupApp(true);

        const res = await request(app)
            .post("/organizations")
            .send({ name: "Test Org" });

        expect(res.status).toBe(201);

        expect(mockService.createOrgS)
            .toHaveBeenCalledWith("Test Org", validUserId);
    });

    /**
     * ❌ Invalid body
     */
    it("should return 400 if body invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post("/organizations")
            .send({ name: "a" }); // слишком короткое имя

        expect(res.status).toBe(400);

        expect(mockService.createOrgS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .post("/organizations")
            .send({ name: "Test Org" });

        expect(res.status).toBe(401);

        expect(mockService.createOrgS).not.toHaveBeenCalled();
    });

});
