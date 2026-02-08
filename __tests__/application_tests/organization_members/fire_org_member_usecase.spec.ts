import { FireOrgMemberUseCase } from "../../../src/modules/organization_members/application/fire_org_member_use_case.js";
import { OrganizationMember } from "../../../src/modules/organization_members/domain/organization_member_domain.js";
import { OrganizationMembersRepository } from "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";

import {
    ActorNotAMemberError,
    TargetNotAMemberError,
    CannotPerformActionOnYourselfError,
} from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import { OrganizationMemberInsufficientPermissionsError } from "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

describe("FireOrgMemberUseCase", () => {
    const ORG_ID = "org-1";
    const ACTOR_ID = "actor-1";
    const TARGET_ID = "target-1";

    let repo: jest.Mocked<OrganizationMembersRepository>;
    let useCase: FireOrgMemberUseCase;

    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        } as any;

        useCase = new FireOrgMemberUseCase(repo);
    });

    /**
     * HAPPY PATH
     */
    it("should allow OWNER to fire MEMBER", async () => {
        repo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, TARGET_ID, "MEMBER")
            );

        repo.delete.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, TARGET_ID, "MEMBER")
        );

        const result = await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID
        );

        expect(repo.delete).toHaveBeenCalledWith(
            TARGET_ID,
            ORG_ID
        );
        expect(result.userId).toBe(TARGET_ID);
    });

    it("should allow OWNER to fire ADMIN", async () => {
        repo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, TARGET_ID, "ADMIN")
            );

        repo.delete.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, TARGET_ID, "ADMIN")
        );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID)
        ).resolves.not.toThrow();
    });

    /**
     * ERROR PATHS
     */
    it("should not allow actor to fire himself", async () => {
        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, ACTOR_ID)
        ).rejects.toBeInstanceOf(
            CannotPerformActionOnYourselfError
        );
    });

    it("should throw if actor is not a member", async () => {
        repo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID)
        ).rejects.toBeInstanceOf(
            ActorNotAMemberError
        );
    });

    it("should throw if target is not a member", async () => {
        repo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, "OWNER")
            )
            .mockResolvedValueOnce(null);

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID)
        ).rejects.toBeInstanceOf(
            TargetNotAMemberError
        );
    });

    it("should NOT allow ADMIN to fire anyone", async () => {
        repo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, "ADMIN")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, TARGET_ID, "MEMBER")
            );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

    it("should NOT allow MEMBER to fire anyone", async () => {
        repo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, "MEMBER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, TARGET_ID, "MEMBER")
            );

        await expect(
            useCase.execute(ACTOR_ID, ORG_ID, TARGET_ID)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });
});
