import { SearchOrganizationServ } from "../../../backend/src/modules/organization/controllers/services/search_organization_serv.js";
import { SearchOrganization } from "../../../backend/src/modules/organization/application/service/search_organization.js";

describe("SearchOrganizationServ", () => {

    let txManager: any;
    let service: SearchOrganizationServ;
    let executeSpy: jest.SpyInstance;

    beforeEach(() => {

        txManager = {
            runInTransaction: jest.fn()
        };

        service = new SearchOrganizationServ(txManager);

        executeSpy = jest.spyOn(
            SearchOrganization.prototype,
            "executeTx"
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should execute inside transaction and return result", async () => {

        executeSpy.mockResolvedValue("mock-result");

        txManager.runInTransaction.mockImplementation(
            async (callback: any) => callback({})
        );

        const criteria = { query: "test" };

        const result = await service.searchOrganizationS(
            "actor-id",
            criteria
        );

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);

        expect(executeSpy).toHaveBeenCalledWith(
            "actor-id",
            criteria
        );

        expect(result).toBe("mock-result");
    });

    it("should propagate error if use case fails", async () => {

        executeSpy.mockRejectedValue(new Error("usecase error"));

        txManager.runInTransaction.mockImplementation(
            async (callback: any) => callback({})
        );

        await expect(
            service.searchOrganizationS("actor-id", { query: "test" })
        ).rejects.toThrow("usecase error");

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);
    });

    it("should propagate error if transaction fails", async () => {

        txManager.runInTransaction.mockRejectedValue(
            new Error("tx error")
        );

        await expect(
            service.searchOrganizationS("actor-id", { query: "test" })
        ).rejects.toThrow("tx error");

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);
    });

});
