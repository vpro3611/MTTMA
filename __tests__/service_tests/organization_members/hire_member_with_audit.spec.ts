
import { HireMemberWithAuditUseCase } from
        "../../../backend/src/modules/organization_members/application/services/hire_member_with_audit_use_case.js";

import { AuditEventActions } from
        "../../../backend/src/modules/audit_events/domain/audit_event_actions.js";

import { OrgMemsRole} from "../../../backend/src/modules/organization_members/domain/org_members_role.js";

describe("HireMemberWithAuditUseCase (unit)", () => {

    const dto = {
        actorUserId: "actor-1",
        organizationId: "org-1",
        targetUserId: "target-1",
        role: OrgMemsRole.MEMBER,
    };

    let hireUseCase: any;
    let auditUseCase: any;
    let service: HireMemberWithAuditUseCase;

    beforeEach(() => {
        hireUseCase = {
            execute: jest.fn(),
        };

        auditUseCase = {
            execute: jest.fn(),
        };

        service = new HireMemberWithAuditUseCase(
            hireUseCase,
            auditUseCase
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should hire member and write audit", async () => {

        const fakeResult = {
            organizationId: dto.organizationId,
            userId: dto.targetUserId,
            role: dto.role,
            joinedAt: new Date(),
        };

        hireUseCase.execute.mockResolvedValue(fakeResult);

        const result = await service.executeTx(dto);

        expect(hireUseCase.execute)
            .toHaveBeenCalledWith(
                dto.actorUserId,
                dto.organizationId,
                dto.targetUserId,
                dto.role
            );

        expect(auditUseCase.execute).toHaveBeenCalledTimes(1);

        const auditArg = auditUseCase.execute.mock.calls[0][0];

        expect(auditArg.getAction())
            .toBe(AuditEventActions.ORG_MEMBER_HIRED);

        expect(auditArg.getActorId())
            .toBe(dto.actorUserId);

        expect(auditArg.getOrganizationId())
            .toBe(dto.organizationId);

        expect(result).toEqual(fakeResult);
    });

    /* ===================== HIRE FAILS ===================== */

    it("should NOT write audit if hire fails", async () => {

        hireUseCase.execute
            .mockRejectedValue(new Error("hire failed"));

        await expect(
            service.executeTx(dto)
        ).rejects.toThrow("hire failed");

        expect(auditUseCase.execute).not.toHaveBeenCalled();
    });

    /* ===================== AUDIT FAILS ===================== */

    it("should propagate audit error if audit fails", async () => {

        const fakeResult = {
            organizationId: dto.organizationId,
            userId: dto.targetUserId,
            role: dto.role,
            joinedAt: new Date(),
        };

        hireUseCase.execute.mockResolvedValue(fakeResult);

        auditUseCase.execute
            .mockRejectedValue(new Error("audit failed"));

        await expect(
            service.executeTx(dto)
        ).rejects.toThrow("audit failed");
    });

});
