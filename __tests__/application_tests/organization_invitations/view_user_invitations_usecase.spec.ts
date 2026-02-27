import { ViewUserInvitationsUseCase } from "../../../backend/src/modules/invitations/application/view_user_invitations_use_case.js";
import { UserDoesNotExistError } from "../../../backend/src/modules/organization_task/errors/repository_errors.js";

describe("ViewUserInvitationsUseCase", () => {

    let invitationRepo: any;
    let userRepo: any;

    let useCase: ViewUserInvitationsUseCase;

    const actorId = "user-1";

    beforeEach(() => {
        invitationRepo = {
            getUserInvitations: jest.fn(),
        };

        userRepo = {
            findById: jest.fn(),
        };

        useCase = new ViewUserInvitationsUseCase(
            invitationRepo,
            userRepo
        );
    });

    // --------------------------------------------------
    // USER DOES NOT EXIST
    // --------------------------------------------------

    it("should throw UserDoesNotExistError if user does not exist", async () => {

        userRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(actorId)
        ).rejects.toBeInstanceOf(UserDoesNotExistError);
    });

    // --------------------------------------------------
    // USER NOT ACTIVE
    // --------------------------------------------------

    it("should throw if user is not active", async () => {

        userRepo.findById.mockResolvedValue({
            ensureIsActive: jest.fn(() => {
                throw new Error("User not active");
            }),
        });

        await expect(
            useCase.execute(actorId)
        ).rejects.toThrow("User not active");
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should return user invitations", async () => {

        const fakeUser = {
            ensureIsActive: jest.fn(),
        };

        const fakeInvitations = [
            {
                id: "inv-1",
                role: "MEMBER",
                status: "PENDING",
                organizationName: "Org 1",
                membersCount: 5,
            },
        ];

        userRepo.findById.mockResolvedValue(fakeUser);
        invitationRepo.getUserInvitations.mockResolvedValue(fakeInvitations);

        const result = await useCase.execute(actorId);

        expect(invitationRepo.getUserInvitations)
            .toHaveBeenCalledWith(actorId);

        expect(result).toEqual(fakeInvitations);
    });

});