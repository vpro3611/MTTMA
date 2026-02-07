import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {Name} from "../domain/name.js";
import {OrganizationNotFoundError} from "../errors/organization_repository_errors.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";


export class RenameOrganizationUseCase {
    constructor(private readonly orgRepo: OrganizationRepository) {}

    execute = async (id: string, newName: string) => {
        const validatedNameNew = Name.validate(newName);

        const organization = await this.orgRepo.findById(id);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }

        organization.rename(validatedNameNew)

        await this.orgRepo.save(organization);

        const organizationResponse: OrganizationResponseDto = {
            id: organization.id,
            name: organization.getName(),
            createdAt: organization.getCreatedAt(),
        }
        return organizationResponse;
    }
}