import { RejectInvitationUseCase } from "../../../backend/src/modules/invitations/application/reject_invitation_use_case.js";
import { Invitation } from "../../../backend/src/modules/invitations/domain/invitation_domain.js";
import { InvitationStatus } from "../../../backend/src/modules/invitations/domain/invitation_status.js";
import { InvitationNotFound, InvitationOfDiffUser, UserAlreadyMember } from "../../../backend/src/modules/invitations/errors/application_errors.js";
import { UserNotFound } from "../../../backend/src/modules/user/errors/user_repository_errors.js";

describe("RejectInvitationUseCase", () => {

    let invitationRepo: any;
    let memberRepo: any;
    let userRepo: any;

    let useCase: RejectInvitationUseCase;

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

        userRepo = {
            findById: jest.fn(),
        };

        useCase = new RejectInvitationUseCase(
            invitationRepo,
            memberRepo,
            userRepo
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
    // USER NOT FOUND
    // --------------------------------------------------

    it("should throw UserNotFound if user does not exist", async () => {
        invitationRepo.getInvitationById.mockResolvedValue(mockPendingInvitation());

        userRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toBeInstanceOf(UserNotFound);
    });

    // --------------------------------------------------
    // USER NOT ACTIVE
    // --------------------------------------------------

    it("should throw if user is not active", async () => {
        invitationRepo.getInvitationById.mockResolvedValue(mockPendingInvitation());

        userRepo.findById.mockResolvedValue({
            ensureIsActive: jest.fn(() => {
                throw new Error("User not active");
            }),
        });

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toThrow("User not active");
    });

    // --------------------------------------------------
    // ALREADY MEMBER
    // --------------------------------------------------

    it("should throw UserAlreadyMember if actor is already member", async () => {
        invitationRepo.getInvitationById.mockResolvedValue(mockPendingInvitation());

        userRepo.findById.mockResolvedValue({
            ensureIsActive: jest.fn(),
        });

        memberRepo.findById.mockResolvedValue({}); // actor already member

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toBeInstanceOf(UserAlreadyMember);
    });

    // --------------------------------------------------
    // ACTOR DIFFERENT FROM INVITED
    // --------------------------------------------------

    it("should throw InvitationOfDiffUser if actor is not invited user", async () => {
        invitationRepo.getInvitationById.mockResolvedValue(
            mockPendingInvitation("another-user")
        );

        userRepo.findById.mockResolvedValue({
            ensureIsActive: jest.fn(),
        });

        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toBeInstanceOf(InvitationOfDiffUser);
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should reject invitation successfully", async () => {

        const invitation = mockPendingInvitation();

        invitationRepo.getInvitationById.mockResolvedValue(invitation);

        userRepo.findById.mockResolvedValue({
            ensureIsActive: jest.fn(),
        });

        memberRepo.findById.mockResolvedValue(null);

        const result = await useCase.execute(actorId, invitationId);

        expect(invitation.getStatus()).toBe(InvitationStatus.REJECTED);

        expect(invitationRepo.save).toHaveBeenCalledTimes(1);

        expect(result.status).toBe(InvitationStatus.REJECTED);
        expect(result.invitedUserId).toBe(actorId);
        expect(result.organizationId).toBe(orgId);
    });

});


// --------------------------------------------------
// MOCK HELPER
// --------------------------------------------------

function mockPendingInvitation(invitedUserId: string = "user-1") {
    return new Invitation(
        "inv-1",
        "org-1",
        invitedUserId,
        "inviter-1",
        "MEMBER",
        InvitationStatus.PENDING,
        new Date(),
        new Date(Date.now() + 100000)
    );
}