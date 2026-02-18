import { DeleteOrganizationServ } from
        "../../../src/modules/organization/controllers/services/delete_organization_serv.js";

import { DeleteOrganization } from
        "../../../src/modules/organization/application/service/delete_organization.js";

jest.mock(
    "../../../src/modules/organization/application/service/delete_organization.js",
    () => ({
        DeleteOrganization: jest.fn(),
    })
);

describe("DeleteOrganizationServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: DeleteOrganizationServ;

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue(undefined);

        (DeleteOrganization as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new DeleteOrganizationServ(txManager);
    });

    /**
     * ✅ Positive case
     */
    it("should execute delete organization inside transaction", async () => {

        const result = await service.deleteOrgS("org-1", "user-1");

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith("org-1", "user-1");

        expect(result).toBeUndefined(); // delete обычно ничего не возвращает
    });

    /**
     * ❌ Negative case
     */
    it("should propagate error if use case throws", async () => {

        const error = new Error("Not allowed");

        mockExecute.mockRejectedValue(error);

        await expect(
            service.deleteOrgS("org-1", "user-1")
        ).rejects.toThrow("Not allowed");

        expect(txManager.runInTransaction).toHaveBeenCalled();
        expect(mockExecute).toHaveBeenCalledWith("org-1", "user-1");
    });

});
