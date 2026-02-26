import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {TaskFilters} from "../../DTO/task_filters.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {OrgTaskRepoReader} from "../../organization_tasks_repository/org_task_repo_reader.js";
import {GetOrgTasksListUseCase} from "../../application/get_org_tasks_list_use_case.js";
import {GetOrgTasksListService} from "../../application/service/get_org_tasks_list_service.js";


export class ListTasksServ {
    constructor(private readonly txManager: TransactionManager) {}


    listTasksS = async (organizationId: string, actorId: string, filters?: TaskFilters) => {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const taskRepoReader = new OrgTaskRepoReader(client);

            const listTasksUC = new GetOrgTasksListUseCase(orgMemberRepo, taskRepoReader);
            const listTasksSProxy = new GetOrgTasksListService(listTasksUC);

            return await listTasksSProxy.executeTx(organizationId, actorId, filters);
        })
    }
}