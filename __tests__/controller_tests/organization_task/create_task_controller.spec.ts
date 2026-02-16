
import express from "express";
import request from "supertest";

import {
    CreateTaskController,
    CreateTaskParamsSchema,
    CreateTaskBodySchema
} from "../../../src/modules/organization_task/controller/create_task_controller.js";

import { validate_params } from
        "../../../src/middlewares/validate_params.js";

import { validateZodMiddleware } from
        "../../../src/middlewares/validate_zod_middleware.js";

import { errorMiddleware } from
        "../../../src/middlewares/error_middleware.js";

describe("CreateTaskController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";
    const validUserId = "550e8400-e29b-41d4-a716-446655440001";

    const setupApp = (withUser = true) => {

        mockService = {
            createTaskS: jest.fn().mockResolvedValue({
                id: "task-1",
                title: "Task",
            })
        };

        const controller = new CreateTaskController(mockService);

        app = express();
        app.use(express.json());

        if (withUser) {
            app.use((req: any, res, next) => {
                req.user = { sub: validUserId };
                next();
            });
        }

        app.post(
            "/organizations/:orgId/tasks",
            validate_params(CreateTaskParamsSchema),
            validateZodMiddleware(CreateTaskBodySchema),
            controller.createTaskCont
        );

        app.use(errorMiddleware());
    };

    /**
     * ✅ Happy path (no assignedTo)
     */
    it("should create task without assignedTo", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/tasks`)
            .send({
                title: "Task",
                description: "Description"
            });

        expect(res.status).toBe(201);

        expect(mockService.createTaskS).toHaveBeenCalledWith({
            organizationId: validOrgId,
            title: "Task",
            description: "Description",
            assignedTo: undefined,
            createdBy: validUserId,
        });
    });

    /**
     * ✅ Happy path (with assignedTo)
     */
    it("should create task with assignedTo", async () => {

        setupApp(true);

        const assignedToId = "550e8400-e29b-41d4-a716-446655440002";

        const res = await request(app)
            .post(`/organizations/${validOrgId}/tasks`)
            .send({
                title: "Task",
                description: "Description",
                assignedTo: assignedToId
            });

        expect(res.status).toBe(201);

        expect(mockService.createTaskS).toHaveBeenCalledWith({
            organizationId: validOrgId,
            title: "Task",
            description: "Description",
            assignedTo: assignedToId,
            createdBy: validUserId,
        });
    });

    /**
     * ❌ Invalid body
     */
    it("should return 400 if body invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/tasks`)
            .send({
                title: "", // invalid
                description: "Description"
            });

        expect(res.status).toBe(400);
        expect(mockService.createTaskS).not.toHaveBeenCalled();
    });

    /**
     * ❌ Invalid params
     */
    it("should return 400 if params invalid", async () => {

        setupApp(true);

        const res = await request(app)
            .post(`/organizations/bad/tasks`)
            .send({
                title: "Task",
                description: "Description"
            });

        expect(res.status).toBe(400);
        expect(mockService.createTaskS).not.toHaveBeenCalled();
    });

    /**
     * ❌ No user
     */
    it("should return 401 if user not present", async () => {

        setupApp(false);

        const res = await request(app)
            .post(`/organizations/${validOrgId}/tasks`)
            .send({
                title: "Task",
                description: "Description"
            });

        expect(res.status).toBe(401);
    });

});
