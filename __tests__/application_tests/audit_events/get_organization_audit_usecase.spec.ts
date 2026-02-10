import { GetOrganizationAuditUseCase } from
        "../../../src/modules/audit_events/application/get_org_audit_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

describe("GetOrganizationAuditUseCase (unit)", () => {

    const organizationId = "org-1";
    const actorId = "user-1";

    const createMocks = () => {
        const auditEventReader = {
            getById: jest.fn(),
        };

        const orgMemberRepo = {
            findById: jest.fn(),
        };

        return { auditEventReader, orgMemberRepo };
    };

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

        expect(auditEventReader.getById).not.toHaveBeenCalled();
    });

    it("should throw OrganizationMemberInsufficientPermissionsError if role is MEMBER", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => "MEMBER"
        });

        const useCase = new GetOrganizationAuditUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await expect(
            useCase.execute(actorId, organizationId)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );

        expect(auditEventReader.getById).not.toHaveBeenCalled();
    });

    it("should return audit events if actor has sufficient permissions", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        const fakeResult = ["event1", "event2"];

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => "ADMIN"
        });

        auditEventReader.getById.mockResolvedValue(fakeResult);

        const useCase = new GetOrganizationAuditUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        const result = await useCase.execute(actorId, organizationId);

        expect(result).toEqual(fakeResult);

        expect(auditEventReader.getById)
            .toHaveBeenCalledWith(organizationId);
    });

});
