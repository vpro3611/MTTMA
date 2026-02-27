import { HireOrgMemberUseCase } from "../../../src/modules/organization_members/application/hire_org_member_use_case.js";
import { OrganizationMember } from "../../../src/modules/organization_members/domain/organization_member_domain.js";
import { OrganizationMembersRepository } from "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";
import { UserRepository } from "../../../src/modules/user/domain/ports/user_repo_interface.js";
import { CheckForMembership } from "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";

import {
    ActorNotAMemberError,
    CannotAssignRole,
    CannotPerformActionOnYourselfError,
    OnlyOwnerCanAssign,
    OrganizationMemberInsufficientPermissionsError,
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import { UserNotFoundError } from "../../../src/modules/organization_members/errors/organization_members_repo_errors.js";
import { UserAlreadyMember } from "../../../src/modules/invitations/errors/application_errors.js";
import { TargetIsMemberOfOtherOrganization } from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import { Email } from "../../../src/modules/user/domain/email.js";
import { Password } from "../../../src/modules/user/domain/password.js";
import { User } from "../../../src/modules/user/domain/user_domain.js";
import { UserStatus } from "../../../src/modules/user/domain/user_status.js";
import { UserIsBannedError } from "../../../src/modules/user/errors/user_domain_error.js";

import { OrgMemsRole } from "../../../src/modules/organization_members/domain/org_members_role.js";

describe("HireOrgMemberUseCase", () => {

    const ORG_ID = "org-1";
    const ACTOR_ID = "actor-1";
    const TARGET_ID = "target-1";

    let orgMemberRepo: jest.Mocked<OrganizationMembersRepository>;
    let userRepo: jest.Mocked<UserRepository>;
    let membershipRepo: jest.Mocked<CheckForMembership>;

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

        membershipRepo = {
            findRelations: jest.fn(),
        } as any;

        membershipRepo.findRelations.mockResolvedValue(false);

        useCase = new HireOrgMemberUseCase(
            orgMemberRepo,
            userRepo,
            membershipRepo
        );
    });

    /* ===================== HAPPY PATHS ===================== */

    it("should allow OWNER to hire MEMBER", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());

        orgMemberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, OrgMemsRole.OWNER)
            )
            .mockResolvedValueOnce(null);

        const result = await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            OrgMemsRole.MEMBER
        );

        expect(orgMemberRepo.save).toHaveBeenCalledTimes(1);

        expect(result).toMatchObject({
            userId: expect.any(String),
            organizationId: ORG_ID,
            role: OrgMemsRole.MEMBER,
            joinedAt: expect.any(Date),
        });
    });

    it("should allow ADMIN to hire MEMBER", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());

        orgMemberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, OrgMemsRole.ADMIN)
            )
            .mockResolvedValueOnce(null);

        await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            OrgMemsRole.MEMBER
        );

        expect(orgMemberRepo.save).toHaveBeenCalledTimes(1);
    });

    /* ===================== USER CHECK ===================== */

    it("should throw if target user does not exist", async () => {

        userRepo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.MEMBER)
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("should throw if user is banned", async () => {

        const bannedUser = new User(
            TARGET_ID,
            Email.create("banned@mail.com"),
            Password.fromHash("StrongPassword123!"),
            UserStatus.BANNED,
            new Date()
        );

        userRepo.findById.mockResolvedValueOnce(bannedUser);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.MEMBER)
        ).rejects.toBeInstanceOf(UserIsBannedError);
    });

    /* ===================== MEMBERSHIP CHECKS ===================== */

    it("should throw if user already member of this org", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());

        orgMemberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, OrgMemsRole.OWNER)
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, TARGET_ID, OrgMemsRole.MEMBER)
            );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.MEMBER)
        ).rejects.toBeInstanceOf(UserAlreadyMember);
    });

    it("should throw if user belongs to another organization", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());

        orgMemberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, OrgMemsRole.OWNER)
            )
            .mockResolvedValueOnce(null);

        membershipRepo.findRelations.mockResolvedValueOnce(true);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.MEMBER)
        ).rejects.toBeInstanceOf(TargetIsMemberOfOtherOrganization);
    });

    /* ===================== PERMISSIONS ===================== */

    it("should throw if actor is not a member", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());
        orgMemberRepo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.MEMBER)
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if actor tries to act on himself", async () => {

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, ACTOR_ID, OrgMemsRole.MEMBER)
        ).rejects.toBeInstanceOf(CannotPerformActionOnYourselfError);
    });

    it("should NOT allow assigning OWNER role", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());

        orgMemberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, OrgMemsRole.OWNER)
            )
            .mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.OWNER)
        ).rejects.toBeInstanceOf(CannotAssignRole);
    });

    it("should NOT allow ADMIN to assign ADMIN", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());

        orgMemberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, OrgMemsRole.ADMIN)
            )
            .mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.ADMIN)
        ).rejects.toBeInstanceOf(OnlyOwnerCanAssign);
    });

    it("should NOT allow MEMBER to hire anyone", async () => {

        userRepo.findById.mockResolvedValueOnce(makeUser());

        orgMemberRepo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, OrgMemsRole.MEMBER)
            )
            .mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, OrgMemsRole.MEMBER)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

});