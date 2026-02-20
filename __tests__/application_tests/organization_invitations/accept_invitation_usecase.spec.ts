import { AcceptInvitationUseCase } from "../../../src/modules/invitations/application/accept_invitation_use_case.js";
import { InvitationStatus } from "../../../src/modules/invitations/domain/invitation_status.js";
import { Invitation } from "../../../src/modules/invitations/domain/invitation_domain.js";
import { InvitationNotFound, InvitationOfDiffUser, UserAlreadyMember } from "../../../src/modules/invitations/errors/application_errors.js";
import { UserNotFound } from "../../../src/modules/user/errors/user_repository_errors.js";

describe("AcceptInvitationUseCase", () => {

    let invitationRepo: any;
    let memberRepo: any;
    let userRepo: any;

    let useCase: AcceptInvitationUseCase;

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
            save: jest.fn(),
        };

        userRepo = {
            findById: jest.fn(),
        };

        useCase = new AcceptInvitationUseCase(
            invitationRepo,
            memberRepo,
            userRepo
        );
    });

    // --------------------------------------------------
    // NOT FOUND
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
    // ACTOR DIFFERENT FROM INVITED
    // --------------------------------------------------

    it("should throw InvitationOfDiffUser if actor is not invited user", async () => {
        const invitation = mockPendingInvitation("another-user");

        invitationRepo.getInvitationById.mockResolvedValue(invitation);

        userRepo.findById.mockResolvedValue(mockActiveUser());

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toBeInstanceOf(InvitationOfDiffUser);
    });

    // --------------------------------------------------
    // ALREADY MEMBER
    // --------------------------------------------------

    it("should throw UserAlreadyMember if user is already member", async () => {
        invitationRepo.getInvitationById.mockResolvedValue(mockPendingInvitation());

        userRepo.findById.mockResolvedValue(mockActiveUser());

        memberRepo.findById.mockResolvedValue({}); // member exists

        await expect(
            useCase.execute(actorId, invitationId)
        ).rejects.toBeInstanceOf(UserAlreadyMember);
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should accept invitation and create membership", async () => {

        const invitation = mockPendingInvitation();

        invitationRepo.getInvitationById.mockResolvedValue(invitation);
        userRepo.findById.mockResolvedValue(mockActiveUser());
        memberRepo.findById.mockResolvedValue(null);

        const result = await useCase.execute(actorId, invitationId);

        expect(invitation.getStatus()).toBe(InvitationStatus.ACCEPTED);

        expect(invitationRepo.save).toHaveBeenCalledTimes(1);
        expect(memberRepo.save).toHaveBeenCalledTimes(1);

        expect(result.status).toBe(InvitationStatus.ACCEPTED);
        expect(result.invitedUserId).toBe(actorId);
        expect(result.organizationId).toBe(orgId);
    });

});


// --------------------------------------------------
// MOCK HELPERS
// --------------------------------------------------

function mockPendingInvitation(invitedUserId: string = "user-1") {
    const invitation = new Invitation(
        "inv-1",
        "org-1",
        invitedUserId,
        "inviter-1",
        "MEMBER",
        InvitationStatus.PENDING,
        new Date(),
        new Date(Date.now() + 100000)
    );

    return invitation;
}

function mockActiveUser() {
    return {
        ensureIsActive: jest.fn(),
    };
}