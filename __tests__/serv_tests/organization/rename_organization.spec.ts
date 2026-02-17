import { RenameOrganizationServ } from
        "../../../src/modules/organization/controllers/services/rename_organization_serv.js";

import { RenameWithAudit } from
        "../../../src/modules/organization/application/service/rename_with_audit.js";

jest.mock(
    "../../../src/modules/organization/application/service/rename_with_audit.js",
    () => ({
        RenameWithAudit: jest.fn(),
    })
);

describe("RenameOrganizationServ", () => {

    let txManager: any;
    let mockExecute: jest.Mock;
    let service: RenameOrganizationServ;

    beforeEach(() => {

        mockExecute = jest.fn().mockResolvedValue({
            id: "org-1",
            name: "New Name"
        });

        (RenameWithAudit as jest.Mock)
            .mockImplementation(() => ({
                executeTx: mockExecute
            }));

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new RenameOrganizationServ(txManager);
    });

    /**
     * ✅ Positive case
     */
    it("should execute rename organization inside transaction", async () => {

        const result = await service.renameOrgS(
            "org-1",
            "New Name",
            "user-1"
        );

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith(
            "org-1",
            "New Name",
            "user-1"
        );

        expect(result).toEqual({
            id: "org-1",
            name: "New Name"
        });
    });

    /**
     * ❌ Negative case
     */
    it("should propagate error if use case throws", async () => {

        const error = new Error("Not allowed");

        mockExecute.mockRejectedValue(error);

        await expect(
            service.renameOrgS("org-1", "New Name", "user-1")
        ).rejects.toThrow("Not allowed");

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockExecute).toHaveBeenCalledWith(
            "org-1",
            "New Name",
            "user-1"
        );
    });

});
