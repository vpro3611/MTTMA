import { RenameOrganizationUseCase } from
        "../../../backend/src/modules/organization/application/rename_organization_use_case.js";

import { OrganizationRepository } from
        "../../../backend/src/modules/organization/domain/ports/organization_repo_interface.js";

import { Organization } from
        "../../../backend/src/modules/organization/domain/organiztion_domain.js";

import { Name } from
        "../../../backend/src/modules/organization/domain/name.js";

import {
    OrganizationNotFoundError,
    OrganizationPersistenceError,
} from
        "../../../backend/src/modules/organization/errors/organization_repository_errors.js";

import {
    OrganizationMembersRepository
} from
        "../../../backend/src/modules/organization_members/domain/ports/organization_memebers_repo_interface.js";

import {
    OrganizationMember
} from
        "../../../backend/src/modules/organization_members/domain/organization_member_domain.js";

import {
    ActorNotAMemberError,
    OrganizationMemberInsufficientPermissionsError
} from
        "../../../backend/src/modules/organization_members/errors/organization_members_domain_error.js";

describe('RenameOrganizationUseCase', () => {

    const ORG_ID = "org-1";
    const OWNER_ID = "owner-1";
    const MEMBER_ID = "member-1";

    let repo: jest.Mocked<OrganizationRepository>;
    let memberRepo: jest.Mocked<OrganizationMembersRepository>;
    let useCase: RenameOrganizationUseCase;

    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        memberRepo = {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            getAllMembers: jest.fn(),
        };

        useCase = new RenameOrganizationUseCase(repo, memberRepo);
    });

    /* ===================== HAPPY PATH ===================== */

    it('should allow OWNER to rename organization and return dto', async () => {
        const org = Organization.create(
            Name.validate('Old Name')
        );

        // actor is OWNER
        memberRepo.findById.mockResolvedValueOnce(
            OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
        );

        repo.findById.mockResolvedValue(org);

        const result = await useCase.execute(
            ORG_ID,
            'New Name',
            OWNER_ID
        );

        expect(memberRepo.findById)
            .toHaveBeenCalledWith(OWNER_ID, ORG_ID);

        expect(repo.findById)
            .toHaveBeenCalledWith(ORG_ID);

        expect(repo.save)
            .toHaveBeenCalledWith(org);

        expect(result.name).toBe('New Name');
    });

    /* ===================== CONTEXT ERRORS ===================== */

    it('should throw if actor is not a member', async () => {
        memberRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(ORG_ID, 'New Name', MEMBER_ID)
        ).rejects.toBeInstanceOf(
            ActorNotAMemberError
        );

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw if organization is not found', async () => {
        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
        );

        repo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(ORG_ID, 'New Name', OWNER_ID)
        ).rejects.toBeInstanceOf(
            OrganizationNotFoundError
        );

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw if new name is invalid', async () => {
        const org = Organization.create(
            Name.validate('Old Name')
        );

        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
        );

        repo.findById.mockResolvedValue(org);

        await expect(
            useCase.execute(ORG_ID, 'ab', OWNER_ID)
        ).rejects.toThrow();

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should propagate repository save error', async () => {
        const org = Organization.create(
            Name.validate('Old Name')
        );

        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, OWNER_ID, "OWNER")
        );

        repo.findById.mockResolvedValue(org);

        repo.save.mockRejectedValue(
            new OrganizationPersistenceError()
        );

        await expect(
            useCase.execute(ORG_ID, 'New Name', OWNER_ID)
        ).rejects.toBeInstanceOf(
            OrganizationPersistenceError
        );
    });

    /* ===================== PERMISSION ===================== */

    it('should NOT allow MEMBER to rename organization', async () => {
        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, MEMBER_ID, "MEMBER")
        );

        const org = Organization.create(
            Name.validate('Old Name')
        );

        repo.findById.mockResolvedValue(org);

        await expect(
            useCase.execute(ORG_ID, 'New Name', MEMBER_ID)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should NOT allow ADMIN to rename organization', async () => {
        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, MEMBER_ID, "ADMIN")
        );

        const org = Organization.create(
            Name.validate('Old Name')
        );

        repo.findById.mockResolvedValue(org);

        await expect(
            useCase.execute(ORG_ID, 'New Name', MEMBER_ID)
        ).rejects.toBeInstanceOf(
            OrganizationMemberInsufficientPermissionsError
        );

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should allow OWNER to rename organization', async () => {
        memberRepo.findById.mockResolvedValue(
            OrganizationMember.hire(ORG_ID, MEMBER_ID, "OWNER")
        );

        const org = Organization.create(
            Name.validate('Old Name')
        );

        repo.findById.mockResolvedValue(org);

        const res = await useCase.execute(ORG_ID, 'New Name', OWNER_ID);

        expect(res.name).toBe('New Name');
        expect(repo.save).toHaveBeenCalled();

    });

});
