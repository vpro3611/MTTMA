import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {Name} from "../domain/name.js";
import {Organization} from "../domain/organiztion_domain.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";


export class CreateOrganizationUseCase {
    constructor(private readonly repo: OrganizationRepository) {}

    execute = async (name: string)=> {
        const validatedName = Name.validate(name);
        const organization = Organization.create(validatedName);
        await this.repo.save(organization);

        const organizationResponse: OrganizationResponseDto = {
            id: organization.id,
            name: organization.getName(),
            createdAt: organization.getCreatedAt(),
        }
        return organizationResponse;
    }
}