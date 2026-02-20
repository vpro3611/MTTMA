import {SearchOrganization} from "../../application/service/search_organization.js";
import {SearchOrganizationCriteria} from "../../DTO/search_criteria.js";
import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationRepositorySearch} from "../../repository_realization/organization_repository_search.js";
import {SearchOrganizationUseCase} from "../../application/search_organization_use_case.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";


export class SearchOrganizationServ {
    constructor(private readonly txManager: TransactionManager) {}

    searchOrganizationS = async (actorId: string, criteria: SearchOrganizationCriteria) => {
        return await this.txManager.runInTransaction(async (client) => {
            const organizationRepositorySearch = new OrganizationRepositorySearch(client);
            const userRepo = new UserRepositoryPG(client);
            const organizationSearchUC = new SearchOrganizationUseCase(organizationRepositorySearch, userRepo);

            const searchOrganizationProxy = new SearchOrganization(organizationSearchUC);
            return await searchOrganizationProxy.executeTx(actorId, criteria);
        })
    }
}