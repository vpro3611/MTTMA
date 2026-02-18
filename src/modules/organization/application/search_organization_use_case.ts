import {SearchOrganizationCriteria} from "../DTO/search_criteria.js";
import {UserRepository} from "../../user/domain/ports/user_repo_interface.js";
import {UserNotFound} from "../../user/errors/user_repository_errors.js";
import {SearchOrganizationRepository} from "../domain/ports/organization_repo_interface.js";


export class SearchOrganizationUseCase {
    constructor(private readonly organizationSearch: SearchOrganizationRepository,
                private readonly userRepository: UserRepository
    ) {}

    private async userExists(actorId: string) {
        const user = await this.userRepository.findById(actorId);
        if (!user) throw new UserNotFound();
        return user;
    }

    execute = async (actorId: string, criteria: SearchOrganizationCriteria) => {
        const actor = await this.userExists(actorId);

        actor.checkUserStatus(actor.getStatus());

        const result = await this.organizationSearch.search(criteria);
        return result;
    }
}