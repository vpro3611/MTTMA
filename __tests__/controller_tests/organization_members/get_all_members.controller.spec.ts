
import express from "express";
import request from "supertest";
import { GetAllMembersController } from "../../../backend/src/modules/organization_members/controllers/get_all_members_controller.js";
import { errorMiddleware } from "../../../backend/src/middlewares/error_middleware.js";

describe("GetAllMembersController (HTTP)", () => {

    let app: express.Express;
    let mockService: any;

    beforeEach(() => {

        mockService = {
            getAllMembersS: jest.fn().mockResolvedValue([
                {
                    organizationId: "org-1",
                    userId: "actor-1",
                    role: "ADMIN",
                    joinedAt: new Date("2024-01-01")
                }
            ])
        };

        const controller = new GetAllMembersController(mockService);

        app = express();
        app.use(express.json());

        // имитация auth middleware
        app.use((req: any, _res, next) => {
            req.user = { sub: "actor-1" };
            next();
        });

        app.get("/org/:orgId/members", controller.getAllMembersCont);
        app.use(errorMiddleware());
    });

    it("should return 200 and members list", async () => {

        const res = await request(app)
            .get("/org/550e8400-e29b-41d4-a716-446655440000/members");

        expect(res.status).toBe(200);

        expect(res.body).toEqual([
            {
                organizationId: "org-1",
                userId: "actor-1",
                role: "ADMIN",
                joinedAt: "2024-01-01T00:00:00.000Z"
            }
        ]);

        expect(mockService.getAllMembersS)
            .toHaveBeenCalledWith(
                "actor-1",
                "550e8400-e29b-41d4-a716-446655440000"
            );
    });

    it("should return 401 if user not present", async () => {

        const appNoUser = express();
        appNoUser.use(express.json());

        const controller = new GetAllMembersController(mockService);

        appNoUser.get("/org/:orgId/members", controller.getAllMembersCont);
        appNoUser.use(errorMiddleware());

        const res = await request(appNoUser)
            .get("/org/550e8400-e29b-41d4-a716-446655440000/members");

        expect(res.status).toBe(401);
    });

    it("should propagate service error", async () => {

        mockService.getAllMembersS.mockRejectedValue(
            new Error("service failed")
        );

        const res = await request(app)
            .get("/org/550e8400-e29b-41d4-a716-446655440000/members");

        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});
