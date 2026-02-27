import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationTasksRepositoryPG} from "../../organization_tasks_repository/org_tasks_repo_realization.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {CreateOrganizationTaskUseCase} from "../../application/create_org_task_use_case.js";
import {OrganizationRepositoryPG} from "../../../organization/repository_realization/organization_repository.js";
import {CreateTaskWithAudit} from "../../application/service/create_task_with_audit.js";
import {CreateOrgTaskDataInputDTO} from "../../DTO/create_org_task_dto.js";


export class CreateTaskServ {
    constructor(private readonly txManager: TransactionManager) {}

    createTaskS = async (dto: CreateOrgTaskDataInputDTO) => {
        return await this.txManager.runInTransaction(async (client) => {
            const taskRepo = new OrganizationTasksRepositoryPG(client);
            const auditEvents = new AuditEventsRepositoryPg(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const orgRepo = new OrganizationRepositoryPG(client);

            const auditEventsProxy = new AppendLogAuditEvents(auditEvents);

            const taskCreateUC = new CreateOrganizationTaskUseCase(taskRepo, orgMemberRepo, orgRepo);

            const taskCreateProxy = new CreateTaskWithAudit(taskCreateUC, auditEventsProxy);

            return await taskCreateProxy.executeTx(dto);
        })
    }
}
