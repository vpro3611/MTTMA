import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {DeleteTaskDTO} from "../../DTO/delete_task_dto.js";
import {OrganizationTasksRepositoryPG} from "../../organization_tasks_repository/org_tasks_repo_realization.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {DeleteTaskUseCase} from "../../application/delete_task_use_case.js";
import {DeleteTaskWithAudit} from "../../application/service/delete_task_with_audit.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";


export class DeleteTaskServ {
    constructor(private readonly txManager: TransactionManager) {}

    deleteTaskS = async (dto: DeleteTaskDTO) => {
        return await this.txManager.runInTransaction(async (client) => {
            const taskRepo = new OrganizationTasksRepositoryPG(client);
            const auditEvents = new AuditEventsRepositoryPg(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);

            const auditEventsProxy = new AppendLogAuditEvents(auditEvents);

            const deleteTaskUC = new DeleteTaskUseCase(taskRepo, orgMemberRepo);

            const deleteTaskProxy = new DeleteTaskWithAudit(deleteTaskUC, auditEventsProxy);

            return await deleteTaskProxy.executeTx(dto);
        })
    }
}