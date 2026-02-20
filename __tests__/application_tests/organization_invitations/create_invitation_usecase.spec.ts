import { CreateInvitationUseCase } from "../../../src/modules/invitations/application/create_invitation_use_case.js";
import { OrgMemsRole } from "../../../src/modules/organization_members/domain/org_members_role.js";
import { ActorNotAMemberError } from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";
import { InvalidRoleInInvitation, UserAlreadyMember } from "../../../src/modules/invitations/errors/application_errors.js";
import { UserDoesNotExistError } from "../../../src/modules/organization_task/errors/repository_errors.js";

describe("CreateInvitationUseCase", () => {

    let invitationRepo: any;
    let memberRepo: any;
    let userRepo: any;

    let useCase: CreateInvitationUseCase;

    const actorId = "actor-1";
    const invitedUserId = "user-2";
    const orgId = "org-1";

    beforeEach(() => {
        invitationRepo = {
            save: jest.fn(),
        };

        memberRepo = {
            findById: jest.fn(),
        };

        userRepo = {
            findById: jest.fn(),
        };

        useCase = new CreateInvitationUseCase(
            invitationRepo,
            memberRepo,
            userRepo
        );
    });

    // --------------------------------------------------
    // INVALID ROLE
    // --------------------------------------------------

    it("should throw InvalidRoleInInvitation if role is OWNER", async () => {
        await expect(
            useCase.execute({
                organizationId: orgId,
                invitedUserId,
                actorId,
                role: OrgMemsRole.OWNER,
            })
        ).rejects.toBeInstanceOf(InvalidRoleInInvitation);
    });

    // --------------------------------------------------
    // ACTOR NOT MEMBER
    // --------------------------------------------------

    it("should throw ActorNotAMemberError if actor is not member", async () => {

        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({
                organizationId: orgId,
                invitedUserId,
                actorId,
            })
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    // --------------------------------------------------
    // ACTOR NOT OWNER
    // --------------------------------------------------

    it("should throw if actor is not owner", async () => {

        const fakeMember = {
            ensureIsOwner: jest.fn(() => {
                throw new Error("Not owner");
            }),
            getRole: jest.fn(),
        };

        memberRepo.findById.mockResolvedValue(fakeMember);

        await expect(
            useCase.execute({
                organizationId: orgId,
                invitedUserId,
                actorId,
            })
        ).rejects.toThrow("Not owner");
    });

    // --------------------------------------------------
    // TARGET ALREADY MEMBER
    // --------------------------------------------------

    it("should throw UserAlreadyMember if invited user is already member", async () => {

        const ownerMember = {
            ensureIsOwner: jest.fn(),
            getRole: jest.fn(),
        };

        memberRepo.findById
            .mockResolvedValueOnce(ownerMember) // actor
            .mockResolvedValueOnce({});         // target exists

        await expect(
            useCase.execute({
                organizationId: orgId,
                invitedUserId,
                actorId,
            })
        ).rejects.toBeInstanceOf(UserAlreadyMember);
    });

    // --------------------------------------------------
    // USER DOES NOT EXIST
    // --------------------------------------------------

    it("should throw UserDoesNotExistError if invited user does not exist", async () => {

        const ownerMember = {
            ensureIsOwner: jest.fn(),
            getRole: jest.fn(),
        };

        memberRepo.findById
            .mockResolvedValueOnce(ownerMember)
            .mockResolvedValueOnce(null);

        userRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({
                organizationId: orgId,
                invitedUserId,
                actorId,
            })
        ).rejects.toBeInstanceOf(UserDoesNotExistError);
    });

    // --------------------------------------------------
    // USER NOT ACTIVE
    // --------------------------------------------------

    it("should throw if invited user is not active", async () => {

        const ownerMember = {
            ensureIsOwner: jest.fn(),
            getRole: jest.fn(),
        };

        const fakeUser = {
            getStatus: jest.fn(),
            checkUserStatus: jest.fn(() => {
                throw new Error("User not active");
            }),
        };

        memberRepo.findById
            .mockResolvedValueOnce(ownerMember)
            .mockResolvedValueOnce(null);

        userRepo.findById.mockResolvedValue(fakeUser);

        await expect(
            useCase.execute({
                organizationId: orgId,
                invitedUserId,
                actorId,
            })
        ).rejects.toThrow("User not active");
    });

    // --------------------------------------------------
    // HAPPY PATH
    // --------------------------------------------------

    it("should create invitation successfully", async () => {

        const ownerMember = {
            ensureIsOwner: jest.fn(),
            getRole: jest.fn(),
        };

        const fakeUser = {
            getStatus: jest.fn().mockReturnValue("ACTIVE"),
            checkUserStatus: jest.fn(),
        };

        memberRepo.findById
            .mockResolvedValueOnce(ownerMember)
            .mockResolvedValueOnce(null);

        userRepo.findById.mockResolvedValue(fakeUser);

        const result = await useCase.execute({
            organizationId: orgId,
            invitedUserId,
            actorId,
        });

        expect(invitationRepo.save).toHaveBeenCalledTimes(1);

        expect(result.organizationId).toBe(orgId);
        expect(result.invitedUserId).toBe(invitedUserId);
        expect(result.invitedByUserId).toBe(actorId);
        expect(result.role).toBe(OrgMemsRole.MEMBER);
    });

});