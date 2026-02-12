import { ChangeOrgMemberRoleUseCase } from
        "../../../src/modules/organization_members/application/change_role_org_member_use_case.js";

import { OrganizationMember } from
        "../../../src/modules/organization_members/domain/organization_member_domain.js";

import { OrganizationMembersRepository } from
        "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";

import {
    ActorNotAMemberError,
    TargetNotAMemberError,
    CannotPerformActionOnYourselfError,
    OrganizationMemberInsufficientPermissionsError,
    InvalidOrganizationMemberRoleError
} from
        "../../../src/modules/organization_members/errors/organization_members_domain_error.js";


describe("ChangeOrgMemberRoleUseCase", () => {

    const ORG_ID = "org-1";
    const ACTOR_ID = "actor-1";
    const TARGET_ID = "target-1";

    let repo: jest.Mocked<OrganizationMembersRepository>;
    let useCase: ChangeOrgMemberRoleUseCase;

    beforeEach(() => {

        repo = {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            getAllMembers: jest.fn(),
        } as any;

        useCase = new ChangeOrgMemberRoleUseCase(repo);
    });

    const expectDto = (result: any, expectedRole: string) => {
        expect(result).toMatchObject({
            organizationId: ORG_ID,
            userId: TARGET_ID,
            role: expectedRole,
        });

        expect(result.joinedAt).toBeInstanceOf(Date);
    };

    /* ===================== HAPPY PATH ===================== */

    it("should allow OWNER to downgrade ADMIN to MEMBER", async () => {

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

        const result = await useCase.execute(
            ACTOR_ID,
            TARGET_ID,
            ORG_ID,
            "MEMBER"
        );

        expect(repo.save).toHaveBeenCalledWith(target);
        expectDto(result, "MEMBER");
    });

    it("should allow ADMIN to downgrade MEMBER", async () => {

        const actor = OrganizationMember.hire(
            ORG_ID,
            ACTOR_ID,
            "ADMIN"
        );

        const target = OrganizationMember.hire(
            ORG_ID,
            TARGET_ID,
            "MEMBER"
        );

        repo.findById
            .mockResolvedValueOnce(actor)
            .mockResolvedValueOnce(target);

        const result = await useCase.execute(
            ACTOR_ID,
            TARGET_ID,
            ORG_ID,
            "MEMBER"
        );

        expectDto(result, "MEMBER");
    });

    /* ===================== ERROR PATHS ===================== */

    it("should not allow actor to change own role", async () => {

        await expect(
            useCase.execute(
                ACTOR_ID,
                ACTOR_ID,
                ORG_ID,
                "ADMIN"
            )
        ).rejects.toBeInstanceOf(
            CannotPerformActionOnYourselfError
        );
    });

    it("should throw if actor is not a member", async () => {

        repo.findById.mockResolvedValueOnce(null);

        await expect(
            useCase.execute(
                ACTOR_ID,
                TARGET_ID,
                ORG_ID,
                "MEMBER"
            )
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
            useCase.execute(
                ACTOR_ID,
                TARGET_ID,
                ORG_ID,
                "MEMBER"
            )
        ).rejects.toBeInstanceOf(
            TargetNotAMemberError
        );
    });

    it("should not allow ADMIN to change OWNER role", async () => {

        repo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, "ADMIN")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, TARGET_ID, "OWNER")
            );

        await expect(
            useCase.execute(
                ACTOR_ID,
                TARGET_ID,
                ORG_ID,
                "ADMIN"
            )
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

    it("should not allow MEMBER to change any role", async () => {

        repo.findById
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, ACTOR_ID, "MEMBER")
            )
            .mockResolvedValueOnce(
                OrganizationMember.hire(ORG_ID, TARGET_ID, "MEMBER")
            );

        await expect(
            useCase.execute(
                ACTOR_ID,
                TARGET_ID,
                ORG_ID,
                "ADMIN"
            )
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );
    });

    it("should throw on invalid target role", async () => {

        await expect(
            useCase.execute(
                ACTOR_ID,
                TARGET_ID,
                ORG_ID,
                "SUPER_ADMIN"
            )
        ).rejects.toBeInstanceOf(
            InvalidOrganizationMemberRoleError
        );
    });
});
