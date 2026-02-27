import { GetFilteredAuditOrgUseCase } from
        "../../../backend/src/modules/audit_events/application/get_filtered_audit_org_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../../backend/src/modules/organization_members/errors/organization_members_domain_error.js";

import { AuditEvent } from
        "../../../backend/src/modules/audit_events/domain/audit_event_domain.js";

import { OrgMemsRole } from
        "../../../backend/src/modules/organization_members/domain/org_members_role.js";

describe("GetFilteredAuditOrgUseCase (unit)", () => {

    const orgId = "org-1";
    const actorId = "user-1";

    const createMocks = () => {
        const auditEventReader = {
            getByOrganizationFiltered: jest.fn(),
        };

        const orgMemberRepo = {
            findById: jest.fn(),
        };

        return { auditEventReader, orgMemberRepo };
    };

    const baseQuery = {
        actorId,
        orgId,
        filters: undefined
    };

    /* ===================== CONTEXT ERRORS ===================== */

    it("should throw ActorNotAMemberError if actor not found", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue(null);

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await expect(
            useCase.execute(baseQuery as any)
        ).rejects.toBeInstanceOf(ActorNotAMemberError);

        expect(auditEventReader.getByOrganizationFiltered)
            .not.toHaveBeenCalled();
    });

    it("should throw OrganizationMemberInsufficientPermissionsError if role is MEMBER", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => OrgMemsRole.MEMBER,
            isMember: () => {
                throw new OrganizationMemberInsufficientPermissionsError();
            }
        });

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await expect(
            useCase.execute(baseQuery as any)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );

        expect(auditEventReader.getByOrganizationFiltered)
            .not.toHaveBeenCalled();
    });

    /* ===================== FILTER NORMALIZATION ===================== */

    it("should call reader with default filters when none provided", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => OrgMemsRole.ADMIN,
            isMember: jest.fn(),
        });

        auditEventReader.getByOrganizationFiltered.mockResolvedValue([]);

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await useCase.execute(baseQuery as any);

        expect(auditEventReader.getByOrganizationFiltered)
            .toHaveBeenCalledWith(orgId, {
                action: undefined,
                actorUserId: undefined,
                from: undefined,
                to: undefined,
                limit: 50,
                offset: 0,
            });
    });

    it("should cap limit to 100", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => OrgMemsRole.ADMIN,
            isMember: jest.fn(),
        });

        auditEventReader.getByOrganizationFiltered.mockResolvedValue([]);

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await useCase.execute({
            actorId,
            orgId,
            filters: { limit: 999 }
        } as any);

        expect(auditEventReader.getByOrganizationFiltered)
            .toHaveBeenCalledWith(orgId, expect.objectContaining({
                limit: 100
            }));
    });

    it("should map domain events to AuditDto[]", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => OrgMemsRole.ADMIN,
            isMember: jest.fn(),
        });

        const event = AuditEvent.create(
            actorId,
            orgId,
            "GET_AUDIT_EVENTS_FILTERED"
        );

        auditEventReader.getByOrganizationFiltered.mockResolvedValue([event]);

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        const result = await useCase.execute(baseQuery as any);

        expect(result).toHaveLength(1);

        expect(result[0]).toMatchObject({
            id: event.id,
            actorId: event.getActorId(),
            organizationId: event.getOrganizationId(),
            action: event.getAction(),
            createdAt: event.getCreatedAt(),
        });
    });

});
