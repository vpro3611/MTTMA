import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationTasksRepositoryPG} from "../../organization_tasks_repository/org_tasks_repo_realization.js";
import {FindTaskByIdUseCase} from "../../application/find_task_by_id_use_case.js";
import {FindTaskByIdService} from "../../application/service/find_task_by_id.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";


export class FindTaskByIdServ {
    constructor(private readonly txManager: TransactionManager) {}

    async findTaskByIdS(taskId: string, orgId: string, actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const taskRepo = new OrganizationTasksRepositoryPG(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const findByIdUC = new FindTaskByIdUseCase(taskRepo, orgMemberRepo);

            const findByIdProxy = new FindTaskByIdService(findByIdUC);

            return await findByIdProxy.executeTx(taskId, orgId, actorId);
        })
    }
}