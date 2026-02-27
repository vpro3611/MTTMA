import { CreateOrganizationUseCase } from
        "../../../backend/src/modules/organization/application/create_organization_use_case.js";

import { OrganizationRepository } from
        "../../../backend/src/modules/organization/domain/ports/organization_repo_interface.js";

import { UserRepository } from
        "../../../backend/src/modules/user/domain/ports/user_repo_interface.js";

import { OrganizationPersistenceError } from
        "../../../backend/src/modules/organization/errors/organization_repository_errors.js";

import { UserNotFound } from
        "../../../backend/src/modules/user/errors/user_repository_errors.js";

import { User } from
        "../../../backend/src/modules/user/domain/user_domain.js";

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
        } as any;

        userRepo = {
            findById: jest.fn(),
            save: jest.fn(),
        } as any;

        useCase = new CreateOrganizationUseCase(repo, userRepo);
    });

    /* ===================== HAPPY PATH ===================== */

    it('should create organization and return response dto', async () => {

        const mockUser = {
            id: OWNER_ID,
            getStatus: jest.fn().mockReturnValue('ACTIVE'),
            checkUserStatus: jest.fn(),
        } as unknown as User;

        userRepo.findById.mockResolvedValue(mockUser);

        const result = await useCase.execute(
            'My Organization',
            OWNER_ID
        );

        expect(userRepo.findById)
            .toHaveBeenCalledWith(OWNER_ID);

        expect(mockUser.getStatus)
            .toHaveBeenCalled();

        expect(mockUser.checkUserStatus)
            .toHaveBeenCalledWith('ACTIVE');

        expect(repo.save)
            .toHaveBeenCalledTimes(1);

        expect(result).toEqual({
            id: expect.any(String),
            name: 'My Organization',
            createdAt: expect.any(Date),
        });
    });

    /* ===================== USER NOT FOUND ===================== */

    it('should throw if user does not exist', async () => {

        userRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('My Organization', OWNER_ID)
        ).rejects.toBeInstanceOf(UserNotFound);

        expect(repo.save).not.toHaveBeenCalled();
    });

    /* ===================== USER STATUS CHECK ===================== */

    it('should propagate error if user status is invalid', async () => {

        const mockUser = {
            id: OWNER_ID,
            getStatus: jest.fn().mockReturnValue('BLOCKED'),
            checkUserStatus: jest.fn().mockImplementation(() => {
                throw new Error('User inactive');
            }),
        } as unknown as User;

        userRepo.findById.mockResolvedValue(mockUser);

        await expect(
            useCase.execute('My Organization', OWNER_ID)
        ).rejects.toThrow('User inactive');

        expect(repo.save).not.toHaveBeenCalled();
    });

    /* ===================== NAME VALIDATION ===================== */

    it('should throw if name is invalid', async () => {

        const mockUser = {
            id: OWNER_ID,
            getStatus: jest.fn().mockReturnValue('ACTIVE'),
            checkUserStatus: jest.fn(),
        } as unknown as User;

        userRepo.findById.mockResolvedValue(mockUser);

        await expect(
            useCase.execute('ab', OWNER_ID)
        ).rejects.toThrow();

        expect(repo.save).not.toHaveBeenCalled();
    });

    /* ===================== REPOSITORY ERROR ===================== */

    it('should propagate repository error', async () => {

        const mockUser = {
            id: OWNER_ID,
            getStatus: jest.fn().mockReturnValue('ACTIVE'),
            checkUserStatus: jest.fn(),
        } as unknown as User;

        userRepo.findById.mockResolvedValue(mockUser);

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
