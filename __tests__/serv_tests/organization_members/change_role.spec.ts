import { ChangeRoleServ } from
        "../../../backend/src/modules/organization_members/controllers/services/change_role_serv.js";

import { ChangeRoleWithAuditUseCase } from
        "../../../backend/src/modules/organization_members/application/services/change_role_with_audit_use_case.js";

jest.mock(
    "../../../backend/src/modules/organization_members/application/services/change_role_with_audit_use_case.js",
    () => ({
        ChangeRoleWithAuditUseCase: jest.fn(),
    })
);

describe("ChangeRoleServ", () => {

    let txManager: any;
    let mockProxyInstance: any;
    let service: ChangeRoleServ;

    const dto = {
        actorUserId: "actor-id",
        organizationId: "org-id",
        targetUserId: "target-id",
        role: "ADMIN"
    };

    beforeEach(() => {

        mockProxyInstance = {
            executeTx: jest.fn().mockResolvedValue("success-result")
        };

        (ChangeRoleWithAuditUseCase as jest.Mock)
            .mockImplementation(() => mockProxyInstance);

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new ChangeRoleServ(txManager);
    });

    /**
     * ✅ Happy path
     */
    it("should execute change role inside transaction", async () => {

        const result = await service.changeRoleS(dto);

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockProxyInstance.executeTx)
            .toHaveBeenCalledWith(dto);

        expect(result).toBe("success-result");
    });

    /**
     * ❌ Should propagate error
     */
    it("should throw if use case fails", async () => {

        mockProxyInstance.executeTx
            .mockRejectedValue(new Error("boom"));

        await expect(
            service.changeRoleS(dto)
        ).rejects.toThrow("boom");

        expect(txManager.runInTransaction).toHaveBeenCalled();
    });

});
