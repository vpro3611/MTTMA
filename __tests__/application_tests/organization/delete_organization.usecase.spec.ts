import { DeleteOrganizationUseCase } from
        "../../../src/modules/organization/application/delete_organization_use_case.js";

import { OrganizationRepositoryPG } from
        "../../../src/modules/organization/repository_realization/organization_repository.js";

import { OrganizationMembersRepository } from
        "../../../src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";

import { OrganizationMember } from
        "../../../src/modules/organization_members/domain/organization_member_domain.js";

import { Organization } from
        "../../../src/modules/organization/domain/organiztion_domain.js";

import { Name } from
        "../../../src/modules/organization/domain/name.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from
        "../../../src/modules/organization_members/errors/organization_members_domain_error.js";

import {
    OrganizationNotFoundError
} from
        "../../../src/modules/organization/errors/organization_repository_errors.js";

import {
    CannotDeleteOrganizationError
} from
        "../../../src/modules/organization/errors/application_errors.js";

describe("DeleteOrganizationUseCase", () => {

    const ORG_ID = "org-1";
    const OWNER_ID = "owner-1";
    const MEMBER_ID = "member-1";

    let orgRepo: jest.Mocked<OrganizationRepositoryPG>;
    let memberRepo: jest.Mocked<OrganizationMembersRepository>;
    let useCase: DeleteOrganizationUseCase;

    beforeEach(() => {

        orgRepo = {
            delete: jest.fn(),
        } as any;

        memberRepo = {
            findById: jest.fn(),
            getAllMembers: jest.fn(),
        } as any;

        useCase = new DeleteOrganizationUseCase(
            orgRepo,
            memberRepo
        );
    });

    /* ===================== HAPPY PATH ===================== */

    it("should allow OWNER to delete organization if he is the only member", async () => {

        const owner = OrganizationMember.hire(
            ORG_ID,
            OWNER_ID,
            "OWNER"
        );

        const organization = Organization.create(
            Name.validate("Test Org")
        );

        memberRepo.findById.mockResolvedValue(owner);
        memberRepo.getAllMembers.mockResolvedValue([owner]);
        orgRepo.delete.mockResolvedValue(organization);

        const result = await useCase.execute(
            OWNER_ID,
            ORG_ID
        );

        expect(memberRepo.findById)
            .toHaveBeenCalledWith(OWNER_ID, ORG_ID);

        expect(memberRepo.getAllMembers)
            .toHaveBeenCalledWith(ORG_ID);

        expect(orgRepo.delete)
            .toHaveBeenCalledWith(ORG_ID);

        expect(result).toMatchObject({
            id: organization.id,
            name: organization.getName().getValue(),
            createdAt: organization.getCreatedAt(),
        });

        expect(result.createdAt).toBeInstanceOf(Date);
    });

    /* ===================== MEMBER NOT FOUND ===================== */

    it("should throw if actor is not a member", async () => {

        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(OWNER_ID, ORG_ID)
        ).rejects.toBeInstanceOf(
            ActorNotAMemberError
        );

        expect(orgRepo.delete).not.toHaveBeenCalled();
    });

    /* ===================== NOT OWNER ===================== */

    it("should throw if actor is not OWNER", async () => {

        const member = OrganizationMember.hire(
            ORG_ID,
            MEMBER_ID,
            "MEMBER"
        );

        memberRepo.findById.mockResolvedValue(member);
        memberRepo.getAllMembers.mockResolvedValue([member]);

        await expect(
            useCase.execute(MEMBER_ID, ORG_ID)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );

        expect(orgRepo.delete).not.toHaveBeenCalled();
    });

    /* ===================== MULTIPLE MEMBERS ===================== */

    it("should throw if organization has more than one member", async () => {

        const owner = OrganizationMember.hire(
            ORG_ID,
            OWNER_ID,
            "OWNER"
        );

        const anotherMember = OrganizationMember.hire(
            ORG_ID,
            MEMBER_ID,
            "MEMBER"
        );

        memberRepo.findById.mockResolvedValue(owner);
        memberRepo.getAllMembers.mockResolvedValue([
            owner,
            anotherMember
        ]);

        await expect(
            useCase.execute(OWNER_ID, ORG_ID)
        ).rejects.toBeInstanceOf(
            CannotDeleteOrganizationError
        );

        expect(orgRepo.delete).not.toHaveBeenCalled();
    });

    /* ===================== ORG NOT FOUND ===================== */

    it("should throw if organization does not exist", async () => {

        const owner = OrganizationMember.hire(
            ORG_ID,
            OWNER_ID,
            "OWNER"
        );

        memberRepo.findById.mockResolvedValue(owner);
        memberRepo.getAllMembers.mockResolvedValue([owner]);
        orgRepo.delete.mockResolvedValue(null);

        await expect(
            useCase.execute(OWNER_ID, ORG_ID)
        ).rejects.toBeInstanceOf(
            OrganizationNotFoundError
        );
    });

    it("should throw if only member left is not OWNER", async () => {

        const member = OrganizationMember.hire(
            ORG_ID,
            MEMBER_ID,
            "MEMBER"
        );

        memberRepo.findById.mockResolvedValue(member);
        memberRepo.getAllMembers.mockResolvedValue([member]);

        await expect(
            useCase.execute(MEMBER_ID, ORG_ID)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );

        expect(orgRepo.delete).not.toHaveBeenCalled();
    });

    it("should throw if only OWNER exists but actor is different user", async () => {

        const realOwner = OrganizationMember.hire(
            ORG_ID,
            OWNER_ID,
            "OWNER"
        );

        memberRepo.findById.mockImplementation(
            async (actorId: string) => {
                if (actorId === OWNER_ID) {
                    return realOwner;
                }
                return null;
            }
        );

        memberRepo.getAllMembers.mockResolvedValue([realOwner]);

        await expect(
            useCase.execute("fake-user", ORG_ID)
        ).rejects.toBeInstanceOf(
            ActorNotAMemberError
        );

        expect(orgRepo.delete).not.toHaveBeenCalled();
    });
});
