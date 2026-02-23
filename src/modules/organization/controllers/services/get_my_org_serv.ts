import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {MyOrganizationsRepository} from "../../repository_realization/my_organizations_repository.js";
import {GetMyOrganizationsUseCase} from "../../application/get_my_organizations_use_case.js";
import {GetMyOrganizationService} from "../../application/service/get_my_organization_service.js";


export class GetMyOrgServ {
    constructor(private readonly txManager: TransactionManager) {}


    getMyOrgS = async (actorId: string) => {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const orgRepo = new MyOrganizationsRepository(client);

            const getMyOrgsUC = new GetMyOrganizationsUseCase(userRepo, orgRepo);
            const getMyOrgsProxy = new GetMyOrganizationService(getMyOrgsUC);

            return await getMyOrgsProxy.executeTx(actorId);
        })
    }
}