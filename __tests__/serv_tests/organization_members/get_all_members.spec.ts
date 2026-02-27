import { GetAllMembersServ } from "../../../backend/src/modules/organization_members/controllers/services/get_all_members_serv.js";
import { GetAllMembersWithAudit } from "../../../backend/src/modules/organization_members/application/services/get_all_members_with_audit.js";

describe("GetAllMembersServ (spy version)", () => {

    let txManager: any;
    let service: GetAllMembersServ;
    let executeSpy: jest.SpyInstance;

    beforeEach(() => {

        txManager = {
            runInTransaction: jest.fn()
        };

        service = new GetAllMembersServ(txManager);

        executeSpy = jest
            .spyOn(GetAllMembersWithAudit.prototype, "executeTx")
            .mockResolvedValue([
                {
                    organizationId: "org-1",
                    userId: "actor-1",
                    role: "ADMIN",
                    joinedAt: new Date("2024-01-01"),
                }
            ]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should execute inside transaction and return result", async () => {

        txManager.runInTransaction.mockImplementation(async (callback: any) => {
            return callback({}); // fake client
        });

        const result = await service.getAllMembersS("actor-1", "org-1");

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);

        expect(executeSpy).toHaveBeenCalledWith("actor-1", "org-1");

        expect(result).toEqual([
            {
                organizationId: "org-1",
                userId: "actor-1",
                role: "ADMIN",
                joinedAt: new Date("2024-01-01"),
            }
        ]);
    });

    it("should propagate error from executeTx", async () => {

        executeSpy.mockRejectedValueOnce(new Error("usecase failed"));

        txManager.runInTransaction.mockImplementation(async (callback: any) => {
            return callback({});
        });

        await expect(
            service.getAllMembersS("actor-1", "org-1")
        ).rejects.toThrow("usecase failed");

        expect(txManager.runInTransaction).toHaveBeenCalled();
    });

    it("should propagate error if transaction fails", async () => {

        txManager.runInTransaction.mockRejectedValue(
            new Error("tx failed")
        );

        await expect(
            service.getAllMembersS("actor-1", "org-1")
        ).rejects.toThrow("tx failed");

        expect(txManager.runInTransaction).toHaveBeenCalled();
        expect(executeSpy).not.toHaveBeenCalled();
    });

});
