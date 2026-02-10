import { GetFilteredAuditOrgUseCase } from
        "../../../src/modules/audit_events/application/get_filtered_audit_org_use_case.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

describe("GetFilteredAuditOrgUseCase (unit)", () => {

    const orgId = "org-1";
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

    const baseQuery = {
        actorId,
        orgId,
        filters: undefined
    };

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

        expect(auditEventReader.getByOrganization).not.toHaveBeenCalled();
    });

    it("should throw OrganizationMemberInsufficientPermissionsError if role is MEMBER", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => "MEMBER"
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

        expect(auditEventReader.getByOrganization).not.toHaveBeenCalled();
    });

    it("should call reader with default filters when none provided", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => "ADMIN"
        });

        auditEventReader.getByOrganization.mockResolvedValue([]);

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await useCase.execute(baseQuery as any);

        expect(auditEventReader.getByOrganization)
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
            getRole: () => "ADMIN"
        });

        auditEventReader.getByOrganization.mockResolvedValue([]);

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await useCase.execute({
            actorId,
            orgId,
            filters: {
                limit: 999
            }
        } as any);

        expect(auditEventReader.getByOrganization)
            .toHaveBeenCalledWith(orgId, expect.objectContaining({
                limit: 100
            }));
    });

    it("should pass provided filters correctly", async () => {
        const { auditEventReader, orgMemberRepo } = createMocks();

        orgMemberRepo.findById.mockResolvedValue({
            getRole: () => "ADMIN"
        });

        auditEventReader.getByOrganization.mockResolvedValue([]);

        const from = new Date("2024-01-01");
        const to = new Date("2024-12-31");

        const useCase = new GetFilteredAuditOrgUseCase(
            auditEventReader as any,
            orgMemberRepo as any
        );

        await useCase.execute({
            actorId,
            orgId,
            filters: {
                action: "ORG_MEMBER_HIRED",
                actorUserId: "actor-x",
                from,
                to,
                limit: 10,
                offset: 5
            }
        } as any);

        expect(auditEventReader.getByOrganization)
            .toHaveBeenCalledWith(orgId, {
                action: "ORG_MEMBER_HIRED",
                actorUserId: "actor-x",
                from,
                to,
                limit: 10,
                offset: 5,
            });
    });

});
