import { FireMemberWithAuditUseCase } from
        "../../../src/modules/organization_members/application/services/fire_member_with_audit_use_case.js";

import { AuditEventActions } from
        "../../../src/modules/audit_events/domain/audit_event_actions.js";

describe("FireMemberWithAuditUseCase (unit)", () => {

    const dto = {
        actorUserId: "actor-1",
        organizationId: "org-1",
        targetUserId: "target-1",
    };

    let fireMemberUseCase: any;
    let auditUseCase: any;
    let service: FireMemberWithAuditUseCase;

    beforeEach(() => {
        fireMemberUseCase = {
            execute: jest.fn(),
        };

        auditUseCase = {
            execute: jest.fn(),
        };

        service = new FireMemberWithAuditUseCase(
            fireMemberUseCase,
            auditUseCase
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should fire member and write audit", async () => {

        const fakeResult = {
            organizationId: dto.organizationId,
            userId: dto.targetUserId,
            role: "MEMBER",
            joinedAt: new Date(),
        };

        fireMemberUseCase.execute.mockResolvedValue(fakeResult);

        const result = await service.executeTx(dto);

        expect(fireMemberUseCase.execute)
            .toHaveBeenCalledWith(
                dto.actorUserId,
                dto.organizationId,
                dto.targetUserId
            );

        expect(auditUseCase.execute).toHaveBeenCalledTimes(1);

        const auditArg = auditUseCase.execute.mock.calls[0][0];

        expect(auditArg.getAction())
            .toBe(AuditEventActions.ORG_MEMBER_FIRED);

        expect(auditArg.getActorId())
            .toBe(dto.actorUserId);

        expect(auditArg.getOrganizationId())
            .toBe(dto.organizationId);

        expect(result).toEqual(fakeResult);
    });

    /* ===================== FIRE FAILS ===================== */

    it("should NOT write audit if fire fails", async () => {

        fireMemberUseCase.execute
            .mockRejectedValue(new Error("fire failed"));

        await expect(
            service.executeTx(dto)
        ).rejects.toThrow("fire failed");

        expect(auditUseCase.execute).not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAILS ===================== */

    it("should propagate audit error if audit fails", async () => {

        const fakeResult = {
            organizationId: dto.organizationId,
            userId: dto.targetUserId,
            role: "MEMBER",
            joinedAt: new Date(),
        };

        fireMemberUseCase.execute.mockResolvedValue(fakeResult);

        auditUseCase.execute
            .mockRejectedValue(new Error("audit failed"));

        await expect(
            service.executeTx(dto)
        ).rejects.toThrow("audit failed");
    });

});
