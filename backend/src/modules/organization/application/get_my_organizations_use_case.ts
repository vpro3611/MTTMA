import {
    OrganizationMemberRepositoryPG
} from "../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserNotFound} from "../../user/errors/user_repository_errors.js";
import {MyOrganizationsRepository} from "../repository_realization/my_organizations_repository.js";
import {Organization} from "../domain/organiztion_domain.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";


export class GetMyOrganizationsUseCase {
    constructor(private readonly userRepo: UserRepository,
                private readonly organizationsRepo: MyOrganizationsRepository) {}

    private async userExists(actorId: string) {
        const user = await this.userRepo.findById(actorId);
        if (!user) throw new UserNotFound();
        return user;
    }

    private mapToDTO(organization: Organization): OrganizationResponseDto {
        return {
            id: organization.id,
            name: organization.getName().getValue(),
            createdAt: organization.getCreatedAt(),
        }
    }

    async execute(actorId: string) {
        const user = await this.userExists(actorId);

        user.ensureIsActive();

        const orgs = await this.organizationsRepo.myOrganizations(actorId);

        return orgs.map((org) => this.mapToDTO(org));

    }
}