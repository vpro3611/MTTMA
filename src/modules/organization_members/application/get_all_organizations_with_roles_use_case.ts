import {OrganizationRepositoryPG} from "../../organization/repository_realization/organization_repository.js";
import {
    OrganizationMembersRepository,
    OrganizationMembersRepositoryReadOnly
} from "../domain/ports/organization_memebers_repo_interface.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserNotFoundError} from "../errors/organization_members_repo_errors.js";
import {ActorNotAMemberError} from "../errors/organization_members_domain_error.js";


export class GetAllOrganizationsWithRolesUseCase {
    constructor(
                private readonly orgMemberRepoRonly: OrganizationMembersRepositoryReadOnly,
                private readonly userRepo: UserRepository,
    ) {}

    private async userExists(userId: string) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }


    private async getAllOrgs(userId: string) {
        const allOrgsWithRoles = await this.orgMemberRepoRonly.findAllMembersWithRoleByUserId(userId);
        return allOrgsWithRoles;
    }

    async execute(userId: string) {
        const user = await this.userExists(userId);

        user.ensureIsActive();

        return await this.getAllOrgs(userId);
    }
}