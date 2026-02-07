import { CreateOrganizationUseCase } from "../../../src/modules/organization/application/create_organization_use_case.js";
import { OrganizationRepository } from "../../../src/modules/organization/domain/ports/organization_repo_interface.js";
import { OrganizationPersistenceError } from "../../../src/modules/organization/errors/organization_repository_errors.js";

describe('CreateOrganizationUseCase', () => {

    let repo: jest.Mocked<OrganizationRepository>;
    let useCase: CreateOrganizationUseCase;

    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
        };

        useCase = new CreateOrganizationUseCase(repo);
    });

    it('should create organization and return response dto', async () => {
        const result = await useCase.execute('My Organization');

        expect(repo.save).toHaveBeenCalledTimes(1);

        expect(result.name.getValue()).toBe('My Organization');
        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error if name is invalid', async () => {
        await expect(
            useCase.execute('ab')
        ).rejects.toThrow();

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should propagate repository error', async () => {
        repo.save.mockRejectedValue(
            new OrganizationPersistenceError()
        );

        await expect(
            useCase.execute('Valid Name')
        ).rejects.toBeInstanceOf(
            OrganizationPersistenceError
        );
    });

});
