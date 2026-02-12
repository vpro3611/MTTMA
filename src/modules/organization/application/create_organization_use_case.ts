import {OrganizationRepository} from "../domain/ports/organization_repo_interface.js";
import {Name} from "../domain/name.js";
import {Organization} from "../domain/organiztion_domain.js";
import {OrganizationResponseDto} from "../DTO/organization_response_dto.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {User} from "../../user/domain/user_domain.js";
import {UserNotFound} from "../../user/errors/user_repository_errors.js";


export class CreateOrganizationUseCase {
    constructor(private readonly repo: OrganizationRepository,
                private readonly userRepo: UserRepository
    ) {};

    private async userExists(id: string): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new UserNotFound();
        }
        return user;
    }

    execute = async (name: string, id: string)=> {
        const user = await this.userExists(id);

        user.checkUserStatus(user.getStatus());

        const validatedName = Name.validate(name);
        const organization = Organization.create(validatedName);
        await this.repo.save(organization);

        const organizationResponse: OrganizationResponseDto = {
            id: organization.id,
            name: organization.getName().getValue(),
            createdAt: organization.getCreatedAt(),
        }

        return organizationResponse;
    }
}