import { CancelInvitationUseCase } from "../../../backend/src/modules/invitations/application/cancel_invitation_use_case.js";
import { Invitation } from "../../../backend/src/modules/invitations/domain/invitation_domain.js";
import { InvitationStatus } from "../../../backend/src/modules/invitations/domain/invitation_status.js";
import { InvitationNotFound } from "../../../backend/src/modules/invitations/errors/application_errors.js";
import { ActorNotAMemberError } from "../../../backend/src/modules/organization_members/errors/organization_members_domain_error.js";

describe("CancelInvitationUseCase", () => {

    let invitationRepo: any;
    let memberRepo: any;
    let useCase: CancelInvitationUseCase;

    const actorId = "user-1";
    const orgId = "org-1";
    const invitationId = "inv-1";

    beforeEach(() => {
        invitationRepo = {
            getInvitationById: jest.fn(),
            save: jest.fn(),
        };

        memberRepo = {
            findById: jest.fn(),
        };

        useCase = new CancelInvitationUseCase(
            invitationRepo,
            memberRepo
        );
    });

    // --------------------------------------------------
    // INVITATION NOT FOUND
    // --------------------------------------------------

    it("should throw InvitationNotFound if invitation does not exist", async () => {
        invitationRepo.getInvitationById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toBeInstanceOf(InvitationNotFound);
    });

    // --------------------------------------------------
    // ACTOR NOT MEMBER
    // --------------------------------------------------

    it("should throw ActorNotAMemberError if actor is not a member", async () => {
        invitationRepo.getInvitationById.mockResolvedValue(mockPendingInvitation());

        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    // --------------------------------------------------
    // OWNER CHECK FAILS
    // --------------------------------------------------

    it("should throw if member is not owner", async () => {
        const invitation = mockPendingInvitation();

        invitationRepo.getInvitationById.mockResolvedValue(invitation);

        const fakeMember = {
            ensureIsOwner: jest.fn(() => {
                throw new Error("Not owner");
            }),
            getRole: jest.fn(),
        };

        memberRepo.findById.mockResolvedValue(fakeMember);

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toThrow("Not owner");
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should cancel invitation successfully", async () => {
        const invitation = mockPendingInvitation();

        invitationRepo.getInvitationById.mockResolvedValue(invitation);

        const fakeMember = {
            ensureIsOwner: jest.fn(),
            getRole: jest.fn().mockReturnValue("OWNER"),
        };

        memberRepo.findById.mockResolvedValue(fakeMember);

        const result = await useCase.execute(actorId, invitationId);

        expect(invitation.getStatus()).toBe(InvitationStatus.CANCELED);

        expect(invitationRepo.save).toHaveBeenCalledTimes(1);

        expect(result.status).toBe(InvitationStatus.CANCELED);
        expect(result.organizationId).toBe(orgId);
    });

});


// --------------------------------------------------
// MOCK HELPER
// --------------------------------------------------

function mockPendingInvitation() {
    return new Invitation(
        "inv-1",
        "org-1",
        "user-2",
        "user-1",
        "MEMBER",
        InvitationStatus.PENDING,
        new Date(),
        new Date(Date.now() + 100000)
    );
}