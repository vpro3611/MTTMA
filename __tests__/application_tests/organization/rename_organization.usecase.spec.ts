import { RenameOrganizationUseCase } from "../../../src/modules/organization/application/rename_organization_use_case.js";
import { OrganizationRepository } from "../../../src/modules/organization/domain/ports/organization_repo_interface.js";
import { Organization } from "../../../src/modules/organization/domain/organiztion_domain.js";
import { Name } from "../../../src/modules/organization/domain/name.js";
import {
    OrganizationNotFoundError,
    OrganizationPersistenceError,
} from "../../../src/modules/organization/errors/organization_repository_errors.js";

describe('RenameOrganizationUseCase', () => {

    let repo: jest.Mocked<OrganizationRepository>;
    let useCase: RenameOrganizationUseCase;

    beforeEach(() => {
        repo = {
            findById: jest.fn(),
            findByName: jest.fn(),
            save: jest.fn(),
        };

        useCase = new RenameOrganizationUseCase(repo);
    });

    it('should rename organization and return dto', async () => {
        const org = Organization.create(
            Name.validate('Old Name')
        );

        repo.findById.mockResolvedValue(org);

        const result = await useCase.execute(
            org.id,
            'New Name'
        );

        expect(repo.findById).toHaveBeenCalledWith(org.id);
        expect(repo.save).toHaveBeenCalledWith(org);

        expect(result.name.getValue()).toBe('New Name');
    });

    it('should throw error if organization is not found', async () => {
        repo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('missing-id', 'New Name')
        ).rejects.toBeInstanceOf(
            OrganizationNotFoundError
        );

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw error if new name is invalid', async () => {
        const org = Organization.create(
            Name.validate('Old Name')
        );

        repo.findById.mockResolvedValue(org);

        await expect(
            useCase.execute(org.id, 'ab')
        ).rejects.toThrow();

        expect(repo.save).not.toHaveBeenCalled();
    });

    it('should propagate repository error', async () => {
        const org = Organization.create(
            Name.validate('Old Name')
        );

        repo.findById.mockResolvedValue(org);
        repo.save.mockRejectedValue(
            new OrganizationPersistenceError()
        );

        await expect(
            useCase.execute(org.id, 'New Name')
        ).rejects.toBeInstanceOf(
            OrganizationPersistenceError
        );
    });

});
