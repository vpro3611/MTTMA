import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {GetAllOrgsWithRolesPG} from "../../organization_members_repository_realization/get_all_orgs_with_roles.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {GetAllOrganizationsWithRolesUseCase} from "../../application/get_all_organizations_with_roles_use_case.js";
import {
    GetAllOrganizationsWithRolesService
} from "../../application/services/get_all_organizations_with_roles_service.js";


export class GetAllOrgsWithRolesServ {
    constructor(private readonly txManager: TransactionManager) {}

    async getAllOrgsWithRolesS(actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemRepoRonly = new GetAllOrgsWithRolesPG(client);
            const userRepo = new UserRepositoryPG(client);

            const getAllOrgsWithRolesUC = new GetAllOrganizationsWithRolesUseCase(orgMemRepoRonly, userRepo);
            const getAllOrgsWithRolesProxy = new GetAllOrganizationsWithRolesService(getAllOrgsWithRolesUC);

            return await getAllOrgsWithRolesProxy.executeTx(actorId);
        })
    }
}