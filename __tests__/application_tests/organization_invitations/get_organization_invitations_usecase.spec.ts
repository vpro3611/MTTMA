import { GetOrganizationInvitationUseCase } from "../../../backend/src/modules/invitations/application/get_organization_invitation_use_case.js";
import { ActorNotAMemberError } from "../../../backend/src/modules/organization_members/errors/organization_members_domain_error.js";

describe("GetOrganizationInvitationUseCase", () => {

    let memberRepo: any;
    let invitationRepo: any;
    let useCase: GetOrganizationInvitationUseCase;

    const actorId = "actor-1";
    const orgId = "org-1";

    beforeEach(() => {
        memberRepo = {
            findById: jest.fn(),
        };

        invitationRepo = {
            getInvitationsFiltered: jest.fn(),
        };

        useCase = new GetOrganizationInvitationUseCase(
            memberRepo,
            invitationRepo
        );
    });

    // --------------------------------------------------
    // ACTOR NOT MEMBER
    // --------------------------------------------------

    it("should throw ActorNotAMemberError if actor is not a member", async () => {

        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId, orgId, {})
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    // --------------------------------------------------
    // INSUFFICIENT ROLE
    // --------------------------------------------------

    it("should throw if member role is insufficient", async () => {

        const fakeMember = {
            isMember: jest.fn(() => {
                throw new Error("Insufficient permissions");
            }),
            getRole: jest.fn(),
        };

        memberRepo.findById.mockResolvedValue(fakeMember);

        await expect(
            useCase.execute(actorId, orgId, {})
        ).rejects.toThrow("Insufficient permissions");
    });

    // --------------------------------------------------
    // FILTER OVERRIDE
    // --------------------------------------------------

    it("should override organization_id in filters", async () => {

        const fakeMember = {
            isMember: jest.fn(),
            getRole: jest.fn(),
        };

        memberRepo.findById.mockResolvedValue(fakeMember);

        invitationRepo.getInvitationsFiltered.mockResolvedValue([]);

        const filters = {
            organization_id: "malicious-org",
        };

        await useCase.execute(actorId, orgId, filters);

        expect(invitationRepo.getInvitationsFiltered).toHaveBeenCalledWith(
            expect.objectContaining({
                organization_id: orgId,
            })
        );
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should return mapped DTOs", async () => {

        const fakeMember = {
            isMember: jest.fn(),
            getRole: jest.fn(),
        };

        memberRepo.findById.mockResolvedValue(fakeMember);

        const fakeInvitation = {
            id: "inv-1",
            getOrganizationId: () => orgId,
            getInvitedUserId: () => "user-2",
            getInvitedByUserId: () => actorId,
            getAssignedRole: () => "MEMBER",
            getStatus: () => "PENDING",
            getCreatedAt: () => new Date(),
            getExpiredAt: () => new Date(),
        };

        invitationRepo.getInvitationsFiltered.mockResolvedValue([fakeInvitation]);

        const result = await useCase.execute(actorId, orgId, {});

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("inv-1");
        expect(result[0].organizationId).toBe(orgId);
        expect(result[0].invitedUserId).toBe("user-2");
    });

});