import { HireMemberServ } from
        "../../../src/modules/organization_members/controllers/services/hire_member_serv.js";

import { HireMemberWithAuditUseCase } from
        "../../../src/modules/organization_members/application/services/hire_member_with_audit_use_case.js";
import {OrgMemsRole} from "../../../src/modules/organization_members/domain/org_members_role.js";

jest.mock(
    "../../../src/modules/organization_members/application/services/hire_member_with_audit_use_case.js",
    () => ({
        HireMemberWithAuditUseCase: jest.fn(),
    })
);

describe("HireMemberServ", () => {

    let txManager: any;
    let mockProxyInstance: any;
    let service: HireMemberServ;

    const dto = {
        actorUserId: "actor-id",
        organizationId: "org-id",
        targetUserId: "target-id",
        role: "ADMIN" as OrgMemsRole,
    };

    beforeEach(() => {

        mockProxyInstance = {
            executeTx: jest.fn().mockResolvedValue("hire-success")
        };

        (HireMemberWithAuditUseCase as jest.Mock)
            .mockImplementation(() => mockProxyInstance);

        txManager = {
            runInTransaction: jest.fn((callback) => callback({}))
        };

        service = new HireMemberServ(txManager);
    });

    /**
     * ✅ Happy path
     */
    it("should execute hire member inside transaction", async () => {

        const result = await service.hireMemberS(dto);

        expect(txManager.runInTransaction).toHaveBeenCalled();

        expect(mockProxyInstance.executeTx)
            .toHaveBeenCalledWith(dto);

        expect(result).toBe("hire-success");
    });

    /**
     * ❌ Should propagate error
     */
    it("should throw if use case fails", async () => {

        mockProxyInstance.executeTx
            .mockRejectedValue(new Error("hire failed"));

        await expect(
            service.hireMemberS(dto)
        ).rejects.toThrow("hire failed");

        expect(txManager.runInTransaction).toHaveBeenCalled();
    });

    /**
     * ✅ Should work without optional role
     */
    it("should work when role is undefined", async () => {

        const dtoWithoutRole = {
            actorUserId: "actor-id",
            organizationId: "org-id",
            targetUserId: "target-id",
        };

        await service.hireMemberS(dtoWithoutRole as any);

        expect(mockProxyInstance.executeTx)
            .toHaveBeenCalledWith(dtoWithoutRole);
    });

});
