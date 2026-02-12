import {
    ChangeRoleWithAuditUseCase
} from "../../../src/modules/organization_members/application/services/change_role_with_audit_use_case.js";

describe("ChangeRoleWithAuditUseCase (unit)", () => {

    let changeRole: any;
    let appendAudit: any;
    let service: ChangeRoleWithAuditUseCase;

    const dto = {
        actorUserId: "actor-1",
        organizationId: "org-1",
        targetUserId: "target-1",
        role: "ADMIN",
    };

    beforeEach(() => {
        changeRole = {
            execute: jest.fn()
        };

        appendAudit = {
            execute: jest.fn()
        };

        service = new ChangeRoleWithAuditUseCase(
            changeRole,
            appendAudit
        );
    });

    it("should change role and write audit", async () => {

        const fakeResult = { role: "ADMIN" };

        changeRole.execute.mockResolvedValue(fakeResult);

        const result = await service.executeTx(dto);

        expect(changeRole.execute).toHaveBeenCalled();
        expect(appendAudit.execute).toHaveBeenCalledTimes(1);

        expect(result).toEqual(fakeResult);
    });

    it("should NOT write audit if role change fails", async () => {

        changeRole.execute.mockRejectedValue(new Error("fail"));

        await expect(
            service.executeTx(dto)
        ).rejects.toThrow();

        expect(appendAudit.execute).not.toHaveBeenCalled();
    });

});
