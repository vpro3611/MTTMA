import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserDoesNotExistError} from "../../organization_task/errors/repository_errors.js";
import {Organization} from "../domain/organiztion_domain.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";
import {OrganizationNotFoundError} from "../errors/organization_repository_errors.js";


export class ViewOrganizationUseCase {
    constructor(private readonly organizationRepo: OrganizationRepository,
                private readonly userRepo: UserRepository
    ) {}

    private async userExists(actorId: string) {
        const user = await this.userRepo.findById(actorId);
        if (!user) {
            throw new UserDoesNotExistError();
        }
        return user;
    }

    private async organizationExists(orgId: string) {
        const organization = await this.organizationRepo.findById(orgId);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }
        return organization;
    }

    private mapToDTO(organization: Organization): OrganizationResponseDto {
        return {
            id: organization.id,
            name: organization.getName().getValue(),
            createdAt: organization.getCreatedAt(),
        }
    }

    async execute(actorId: string, orgId: string) {
        const user = await this.userExists(actorId);

        user.ensureIsActive();

        const organization = await this.organizationExists(orgId);

        const forReturn = this.mapToDTO(organization);

        return forReturn;
    }
}