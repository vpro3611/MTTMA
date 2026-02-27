

import { FireMemberServ } from
        "../../../backend/src/modules/organization_members/controllers/services/fire_member_serv.js";

import { FireMemberWithAuditUseCase } from
        "../../../backend/src/modules/organization_members/application/services/fire_member_with_audit_use_case.js";

jest.mock(
    "../../../backend/src/modules/organization_members/application/services/fire_member_with_audit_use_case.js",
    () => ({
        FireMemberWithAuditUseCase: jest.fn(),
    })
);

describe("FireMemberServ", () => {

    let txManager: any;
    let mockProxyInstance: any;
    let service: FireMemberServ;

    const dto = {
        actorUserId: "actor-id",
        organizationId: "org-id",
        targetUserId: "target-id",
    };

    beforeEach(() => {

        mockProxyInstance = {
            executeTx: jest.fn().mockResolvedValue("fire-success")
        };

        (FireMemberWithAuditUseCase as jest.Mock)
            .mockImplementation(() => mockProxyInstance);

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new FireMemberServ(txManager);
    });

    /**
     * ✅ Happy path
     */
    it("should execute fire member inside transaction", async () => {

        const result = await service.fireMemberS(dto);

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);

        expect(mockProxyInstance.executeTx)
            .toHaveBeenCalledWith(dto);

        expect(result).toBe("fire-success");
    });

    /**
     * ❌ Should propagate error from use case
     */
    it("should throw if executeTx fails", async () => {

        mockProxyInstance.executeTx
            .mockRejectedValue(new Error("fire failed"));

        await expect(
            service.fireMemberS(dto)
        ).rejects.toThrow("fire failed");

        expect(txManager.runInTransaction).toHaveBeenCalledTimes(1);
    });

});
