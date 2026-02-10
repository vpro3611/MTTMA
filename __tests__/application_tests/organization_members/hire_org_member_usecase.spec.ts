import { HireOrgMemberUseCase } from "../../../src/modules/organization_members/application/hire_org_member_use_case.js";
import { OrganizationMember } from "../../../src/modules/organization_members/domain/organization_member_domain.js";
import { OrganizationMembersRepository } from "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";
import { UserRepository } from "../../../src/modules/user/domain/ports/user_repo_interface.js";
import { User } from "../../../src/modules/user/domain/user_domain.js";
import {
    ActorNotAMemberError,
    CannotAssignRole,
    CannotPerformActionOnYourselfError,
    OnlyOwnerCanAssign,
    OrganizationMemberInsufficientPermissionsError,
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";
import { UserNotFoundError } from "../../../src/modules/organization_members/errors/organization_members_repo_errors.js";
import { Email } from "../../../src/modules/user/domain/email.js";
import { Password } from "../../../src/modules/user/domain/password.js";

describe("HireOrgMemberUseCase", () => {
    const ORG_ID = "org-1";
    const ACTOR_ID = "actor-1";
    const TARGET_ID = "target-1";

    let orgMemberRepo: jest.Mocked<OrganizationMembersRepository>;
    let userRepo: jest.Mocked<UserRepository>;
    let useCase: HireOrgMemberUseCase;

    const makeUser = () =>
        User.create(
            Email.create("test@mail.com"),
            Password.fromHash("StrongPassword123!")
        );

    beforeEach(() => {
        orgMemberRepo = {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        } as any;

        userRepo = {
            findById: jest.fn(),
            save: jest.fn(),
        } as any;

        useCase = new HireOrgMemberUseCase(
            orgMemberRepo,
            userRepo
        );
    });

    /**
     * HAPPY PATHS
     */
    it("should allow OWNER to hire MEMBER", async () => {
        const user = makeUser();

        userRepo.findById.mockResolvedValueOnce(user);
        orgMemberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
        );

        const result = await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            "MEMBER"
        );

        expect(orgMemberRepo.save).toHaveBeenCalledTimes(1);
        expect(result.userId).toBe(user.id);
        expect(result.role).toBe("MEMBER");
    });

    it("should allow OWNER to hire ADMIN", async () => {
        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
        );

        await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            "ADMIN"
        );

        expect(orgMemberRepo.save).toHaveBeenCalledTimes(1);
    });

    it("should allow ADMIN to hire MEMBER", async () => {
        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "ADMIN")
        );

        await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            "MEMBER"
        );

        expect(orgMemberRepo.save).toHaveBeenCalledTimes(1);
    });

    /**
     * USER CHECK
     */
    it("should throw if target user does not exist", async () => {
        userRepo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "MEMBER")
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("should proceed if target user exists", async () => {
        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
        );

        await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            "MEMBER"
        );

        expect(userRepo.findById).toHaveBeenCalledWith(TARGET_ID);
        expect(orgMemberRepo.save).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: expect.any(String),
                organizationId: ORG_ID,
            })
        );

    });

    /**
     * ERROR CASES
     */
    it("should throw if actor is not a member", async () => {
        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "MEMBER")
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if actor tries to act on himself", async () => {
        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, ACTOR_ID, "MEMBER")
        ).rejects.toBeInstanceOf(
            CannotPerformActionOnYourselfError
        );
    });

    it("should NOT allow assigning OWNER role", async () => {
        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
        );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "OWNER")
        ).rejects.toBeInstanceOf(CannotAssignRole);
    });

    it("should NOT allow ADMIN to assign ADMIN", async () => {
        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "ADMIN")
        );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "ADMIN")
        ).rejects.toBeInstanceOf(OnlyOwnerCanAssign);
    });

    it("should NOT allow MEMBER to hire anyone", async () => {
        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "MEMBER")
        );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "MEMBER")
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });
});
