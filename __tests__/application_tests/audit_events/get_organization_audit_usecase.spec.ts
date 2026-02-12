import { GetOrganizationAuditUseCase } from
        "../../../src/modules/audit_events/application/get_org_audit_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import { AuditEvent } from
        "../../../src/modules/audit_events/domain/audit_event_domain.js";

import { OrgMemsRole } from
        "../../../src/modules/organization_members/domain/org_members_role.js";

describe("GetOrganizationAuditUseCase (unit)", () => {

    const organizationId = "org-1";
    const actorId = "user-1";

    const createMocks = () => {
        const auditEventReader = {
            getByOrganization: jest.fn(),
        };

        const orgMemberRepo = {
            findById: jest.fn(),
        };

        return { auditEventReader, orgMemberRepo };
    };

    const makeActor = (
        role: OrgMemsRole,
        shouldThrow = false
    ) => ({
        getRole: () => role,
        isMember: shouldThrow
            ? () => { throw new OrganizationMemberInsufficientPermissionsError(); }
            : jest.fn(),
    });

    /* ===================== CONTEXT ERRORS ===================== */

    it("should throw ActorNotAMemberError if actor not found", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue(null);

        const useCase = new GetOrganizationAuditUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await expect(
            useCase.execute(actorId, organizationId)
        ).rejects.toBeInstanceOf(ActorNotAMemberError);

        expect(auditEventReader.getByOrganization).not.toHaveBeenCalled();
    });

    it("should throw OrganizationMemberInsufficientPermissionsError if role is MEMBER", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue(
            makeActor(OrgMemsRole.MEMBER, true)
        );

        const useCase = new GetOrganizationAuditUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await expect(
            useCase.execute(actorId, organizationId)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );

        expect(auditEventReader.getByOrganization).not.toHaveBeenCalled();
    });

    /* ===================== HAPPY PATH ===================== */

    it("should return mapped audit DTOs if actor has sufficient permissions", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        const event1 = AuditEvent.create(
            actorId,
            organizationId,
            "GET_AUDIT_EVENT"
        );

        const event2 = AuditEvent.create(
            actorId,
            organizationId,
            "GET_AUDIT_EVENT"
        );

        orgMemberRepo.findById.mockResolvedValue(
            makeActor(OrgMemsRole.ADMIN)
        );

        auditEventReader.getByOrganization.mockResolvedValue([
            event1,
            event2
        ]);

        const useCase = new GetOrganizationAuditUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        const result = await useCase.execute(actorId, organizationId);

        expect(result).toHaveLength(2);

        expect(result[0]).toMatchObject({
            id: event1.id,
            actorId: event1.getActorId(),
            organizationId: event1.getOrganizationId(),
            action: event1.getAction(),
            createdAt: event1.getCreatedAt(),
        });

        expect(result[1]).toMatchObject({
            id: event2.id,
            actorId: event2.getActorId(),
            organizationId: event2.getOrganizationId(),
            action: event2.getAction(),
            createdAt: event2.getCreatedAt(),
        });

        expect(auditEventReader.getByOrganization)
            .toHaveBeenCalledWith(organizationId);
    });

});
