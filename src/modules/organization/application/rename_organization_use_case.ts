import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {Name} from "../domain/name.js";
import {OrganizationNotFoundError} from "../errors/organization_repository_errors.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";
import {Organization} from "../domain/organiztion_domain.js";


export class RenameOrganizationUseCase {
    constructor(private readonly orgRepo: OrganizationRepository) {}

    private async organizationExists(id: string): Promise<Organization> {
        const organization = await this.orgRepo.findById(id);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }
        return organization;
    }

    execute = async (id: string, newName: string) => {
        const validatedNameNew = Name.validate(newName);

        const organization = await this.organizationExists(id);

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