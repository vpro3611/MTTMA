import { FireOrgMemberUseCase } from
        "../../../src/modules/organization_members/application/fire_org_member_use_case.js";

import { OrganizationMember } from
        "../../../src/modules/organization_members/domain/organization_member_domain.js";

import { OrganizationMembersRepository } from
        "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";

import {
    ActorNotAMemberError,
    TargetNotAMemberError,
    CannotPerformActionOnYourselfError,
    OrganizationMemberInsufficientPermissionsError,
} from
        "../../../src/modules/organization_members/errors/organization_members_domain_error.js";


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
            getAllMembers: jest.fn(),
        } as any;

        useCase = new FireOrgMemberUseCase(repo);
    });

    const expectDto = (result: any, role: string) => {
        expect(result).toMatchObject({
            organizationId: ORG_ID,
            userId: TARGET_ID,
            role,
        });

        expect(result.joinedAt).toBeInstanceOf(Date);
    };

    /* ===================== HAPPY PATH ===================== */

    it("should allow OWNER to fire MEMBER", async () => {

        const actor = OrganizationMember.hire(
            ORG_ID,
            ACTOR_ID,
            "OWNER"
        );

        const target = OrganizationMember.hire(
            ORG_ID,
            TARGET_ID,
            "MEMBER"
        );

        repo.findById
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        repo.delete.mockResolvedValue(target);

        const result = await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID
        );

        expect(repo.delete)
            .toHaveBeenCalledWith(TARGET_ID, ORG_ID);

        expectDto(result, "MEMBER");
    });

    it("should allow OWNER to fire ADMIN", async () => {

        const actor = OrganizationMember.hire(
            ORG_ID,
            ACTOR_ID,
            "OWNER"
        );

        const target = OrganizationMember.hire(
            ORG_ID,
            TARGET_ID,
            "ADMIN"
        );

        repo.findById
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        repo.delete.mockResolvedValue(target);

        const result = await useCase.execute(
            ACTOR_ID,
            ORG_ID,
            TARGET_ID
        );

        expectDto(result, "ADMIN");
    });

    /* ===================== ERROR PATHS ===================== */

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
