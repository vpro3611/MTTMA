import express from "express";
import request from "supertest";
import { GetAuditByOrgIdController } from "../../../backend/src/modules/audit_events/controllers/get_audit_by_org_id_controller.js";
import { errorMiddleware } from "../../../backend/src/middlewares/error_middleware.js";

describe("GetAuditByOrgIdController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";

    beforeEach(() => {

        mockService = {
            getAuditByOrgIdS: jest.fn().mockResolvedValue([
                { id: "audit-1", action: "TASK_CREATED" }
            ])
        };

        const controller = new GetAuditByOrgIdController(mockService);

        app = express();
        app.use(express.json());

        // auth middleware mock
        app.use((req: any, res, next) => {
            req.user = { sub: "actor-1" };
            next();
        });

        app.get(
            "/org/:orgId/audit",
            controller.getAuditByOrgIdCont
        );

        app.use(errorMiddleware());
    });

    /**
     * ✅ Happy path
     */
    it("should return audit events by orgId", async () => {

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);

        expect(mockService.getAuditByOrgIdS)
            .toHaveBeenCalledWith("actor-1", validOrgId);
    });

    /**
     * ❌ No req.user
     */
    it("should return 401 if user not present", async () => {

        const controller = new GetAuditByOrgIdController(mockService);

        app = express();
        app.use(express.json());

        app.get(
            "/org/:orgId/audit",
            controller.getAuditByOrgIdCont
        );

        app.use(errorMiddleware());

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`);

        expect(res.status).toBe(401);
    });

    /**
     * ❌ Service throws error
     */
    it("should propagate service error to error middleware", async () => {

        mockService.getAuditByOrgIdS.mockRejectedValue(
            new Error("Something failed")
        );

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`);

        expect(res.status).toBe(500);
    });
});
