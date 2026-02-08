import { HireOrgMemberUseCase } from "../../../src/modules/organization_members/application/hire_org_member_use_case.js";
import { OrganizationMember } from "../../../src/modules/organization_members/domain/organization_member_domain.js";
import { OrganizationMembersRepository } from "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";
import {
    ActorNotAMemberError,
    CannotAssignRole, CannotPerformActionOnYourselfError,
    OnlyOwnerCanAssign,
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";
import { OrganizationMemberInsufficientPermissionsError } from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

describe("HireOrgMemberUseCase", () => {
    const ORG_ID = "org-1";
    const ACTOR_ID = "actor-1";
    const TARGET_ID = "target-1";

    let repo: jest.Mocked<OrganizationMembersRepository>;
    let useCase: HireOrgMemberUseCase;

    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        } as any;

        useCase = new HireOrgMemberUseCase(repo);
    });

    /**
     * HAPPY PATHS
     */
    it("should allow OWNER to hire MEMBER", async () => {
        repo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
        );

        await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            "MEMBER"
        );

        expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it("should allow OWNER to hire ADMIN", async () => {
        repo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
        );

        await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            "ADMIN"
        );

        expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it("should allow ADMIN to hire MEMBER", async () => {
        repo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "ADMIN")
        );

        await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID,
            "MEMBER"
        );

        expect(repo.save).toHaveBeenCalledTimes(1);
    });

    /**
     * ERROR CASES
     */
    it("should throw if actor is not a member", async () => {
        repo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "MEMBER")
        ).rejects.toBeInstanceOf(ActorNotAMemberError);
    });

    it("should throw if target is performing action on himself", async () => {
        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, ACTOR_ID, "MEMBER")
        ).rejects.toBeInstanceOf(
            CannotPerformActionOnYourselfError
        )
    })

    it("should NOT allow assigning OWNER role", async () => {
        repo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
        );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "OWNER")
        ).rejects.toBeInstanceOf(CannotAssignRole);
    });

    it("should NOT allow ADMIN to assign ADMIN", async () => {
        repo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "ADMIN")
        );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "ADMIN")
        ).rejects.toBeInstanceOf(OnlyOwnerCanAssign);
    });

    it("should NOT allow MEMBER to hire anyone", async () => {
        repo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, ACTOR_ID, "MEMBER")
        );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID, "MEMBER")
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });
});
