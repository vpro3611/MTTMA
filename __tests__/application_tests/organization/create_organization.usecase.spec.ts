import { CreateOrganizationUseCase } from
        "../../../src/modules/organization/application/create_organization_use_case.js";

import { OrganizationRepository } from
        "../../../src/modules/organization/domain/ports/organization_repo_interface.js";

import { UserRepository } from
        "../../../src/modules/user/domain/ports/user_repo_interface.js";

import { OrganizationPersistenceError } from
        "../../../src/modules/organization/errors/organization_repository_errors.js";

import { UserNotFound } from
        "../../../src/modules/user/errors/user_repository_errors.js";

import { User } from
        "../../../src/modules/user/domain/user_domain.js";

describe('CreateOrganizationUseCase', () => {

    const OWNER_ID = "user-1";

    let repo: jest.Mocked<OrganizationRepository>;
    let userRepo: jest.Mocked<UserRepository>;
    let useCase: CreateOrganizationUseCase;

    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        userRepo = {
            findById: jest.fn(),
            save: jest.fn(),
        } as any;

        useCase = new CreateOrganizationUseCase(repo, userRepo);
    });

    /* ===================== HAPPY PATH ===================== */

    it('should create organization if user exists', async () => {

        userRepo.findById.mockResolvedValue(
            { id: OWNER_ID } as User
        );

        const result = await useCase.execute(
            'My Organization',
            OWNER_ID
        );

        expect(userRepo.findById)
            .toHaveBeenCalledWith(OWNER_ID);

        expect(repo.save)
            .toHaveBeenCalledTimes(1);

        expect(result.name).toBe('My Organization');
        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeInstanceOf(Date);
    });

    /* ===================== USER CHECK ===================== */

    it('should throw if user does not exist', async () => {

        userRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('My Organization', OWNER_ID)
        ).rejects.toBeInstanceOf(UserNotFound);

        expect(repo.save).not.toHaveBeenCalled();
    });

    /* ===================== NAME VALIDATION ===================== */

    it('should throw error if name is invalid', async () => {

        userRepo.findById.mockResolvedValue(
            { id: OWNER_ID } as User
        );

        await expect(
            useCase.execute('ab', OWNER_ID)
        ).rejects.toThrow();

        expect(repo.save).not.toHaveBeenCalled();
    });

    /* ===================== REPOSITORY ERROR ===================== */

    it('should propagate repository error', async () => {

        userRepo.findById.mockResolvedValue(
            { id: OWNER_ID } as User
        );

        repo.save.mockRejectedValue(
            new OrganizationPersistenceError()
        );

        await expect(
            useCase.execute('Valid Name', OWNER_ID)
        ).rejects.toBeInstanceOf(
            OrganizationPersistenceError
        );
    });

});
