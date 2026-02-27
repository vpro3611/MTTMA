import express from "express";
import request from "supertest";
import { GetFilteredAuditController } from "../../../backend/src/modules/audit_events/controllers/get_filtered_audit_controller.js";
import { errorMiddleware } from "../../../backend/src/middlewares/error_middleware.js";
import { AuditEventActions } from "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

describe("GetFilteredAuditController (HTTP integration)", () => {

    let app: express.Express;
    let mockService: any;

    const validOrgId = "550e8400-e29b-41d4-a716-446655440000";

    beforeEach(() => {

        mockService = {
            getFilteredAuditS: jest.fn().mockResolvedValue([
                { id: "audit-1", action: "TASK_CREATED" }
            ])
        };

        const controller = new GetFilteredAuditController(mockService);

        app = express();
        app.use(express.json());

        // mock auth middleware
        app.use((req: any, res, next) => {
            req.user = { sub: "actor-1" };
            next();
        });

        app.get(
            "/org/:orgId/audit",
            controller.getFilteredAuditCont
        );

        app.use(errorMiddleware());
    });

    /**
     * ✅ Happy path — без фильтров
     */
    it("should return audit events without filters", async () => {

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);

        expect(mockService.getFilteredAuditS)
            .toHaveBeenCalledWith({
                actorId: "actor-1",
                orgId: validOrgId,
                filters: {},
            });
    });

    /**
     * ✅ Happy path — с фильтрами
     */
    it("should parse and pass filters correctly", async () => {

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`)
            .query({
                action: AuditEventActions.TASK_CREATED,
                actorUserId: "550e8400-e29b-41d4-a716-446655440001",
                limit: "10",
                offset: "5",
                from: "2024-01-01T00:00:00.000Z",
                to: "2024-12-31T00:00:00.000Z",
            });

        expect(res.status).toBe(200);

        const callArg = mockService.getFilteredAuditS.mock.calls[0][0];

        expect(callArg.actorId).toBe("actor-1");
        expect(callArg.orgId).toBe(validOrgId);

        expect(callArg.filters.limit).toBe(10);
        expect(callArg.filters.offset).toBe(5);
        expect(callArg.filters.action).toBe(AuditEventActions.TASK_CREATED);
        expect(callArg.filters.actorUserId)
            .toBe("550e8400-e29b-41d4-a716-446655440001");

        expect(callArg.filters.from).toBeInstanceOf(Date);
        expect(callArg.filters.to).toBeInstanceOf(Date);
    });

    /**
     * ❌ Нет req.user
     */
    it("should return 401 if user not present", async () => {

        const controller = new GetFilteredAuditController(mockService);

        app = express();
        app.use(express.json());

        app.get(
            "/org/:orgId/audit",
            controller.getFilteredAuditCont
        );

        app.use(errorMiddleware());

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`);

        expect(res.status).toBe(401);
    });

    /**
     * ❌ Невалидный query
     */
    it("should return 400 if query invalid", async () => {

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`)
            .query({
                limit: "0" // min(1) → должно упасть
            });

        expect(res.status).toBe(400);
    });

    /**
     * ❌ Сервис бросает ошибку
     */
    it("should return 500 if service throws", async () => {

        mockService.getFilteredAuditS.mockRejectedValue(
            new Error("DB failure")
        );

        const res = await request(app)
            .get(`/org/${validOrgId}/audit`);

        expect(res.status).toBe(500);
    });
});
