import express from "express";
import request from "supertest";
import { SearchOrganizationController } from "../../../src/modules/organization/controllers/search_organization_controller.js";
import { errorMiddleware } from "../../../src/middlewares/error_middleware.js";

describe("SearchOrganizationController (HTTP)", () => {

    let app: express.Express;
    let mockService: any;

    beforeEach(() => {

        mockService = {
            searchOrganizationS: jest.fn().mockResolvedValue([
                {
                    id: "org-1",
                    name: "Test Org",
                    createdAt: new Date(),
                    membersCount: 5
                }
            ])
        };

        const controller = new SearchOrganizationController(mockService);

        app = express();
        app.use(express.json());

        // имитация auth middleware
        app.use((req: any, res, next) => {
            req.user = { sub: "actor-id" };
            next();
        });

        app.get("/org/search", controller.searchOrganizationCont);
        app.use(errorMiddleware());
    });

    // ✅ Happy path
    it("should return 200 and call service with parsed query", async () => {

        const res = await request(app)
            .get("/org/search")
            .query({
                query: "test",
                sortBy: "membersCount",
                order: "asc",
                limit: "10",
                offset: "0"
            });

        expect(res.status).toBe(200);

        expect(mockService.searchOrganizationS)
            .toHaveBeenCalledWith(
                "actor-id",
                expect.objectContaining({
                    query: "test",
                    sortBy: "membersCount",
                    order: "asc",
                    limit: 10,
                    offset: 0
                })
            );
    });

    // ✅ Happy path с датами
    it("should parse dates correctly", async () => {

        const res = await request(app)
            .get("/org/search")
            .query({
                query: "test",
                createdFrom: "2024-01-01T00:00:00.000Z",
                createdTo: "2024-12-31T00:00:00.000Z"
            });

        expect(res.status).toBe(200);

        const callArgs = mockService.searchOrganizationS.mock.calls[0][1];

        expect(callArgs.createdFrom).toBeInstanceOf(Date);
        expect(callArgs.createdTo).toBeInstanceOf(Date);
    });

    // ❌ Нет req.user
    it("should return 401 if user not present", async () => {

        app = express();
        app.use(express.json());

        const controller = new SearchOrganizationController(mockService);

        app.get("/org/search", controller.searchOrganizationCont);
        app.use(errorMiddleware());

        const res = await request(app)
            .get("/org/search")
            .query({ query: "test" });

        expect(res.status).toBe(401);
    });

    // ❌ Zod validation error
    it("should return 400 if query invalid", async () => {

        const res = await request(app)
            .get("/org/search")
            .query({
                query: "",   // min(1) не пройдет
                limit: "-5"  // invalid
            });

        expect(res.status).toBe(400);
    });

    // ❌ Ошибка сервиса
    it("should propagate service error", async () => {

        mockService.searchOrganizationS.mockRejectedValue(
            new Error("service failed")
        );

        const res = await request(app)
            .get("/org/search")
            .query({ query: "test" });

        expect(res.status).toBe(500);
    });

});
