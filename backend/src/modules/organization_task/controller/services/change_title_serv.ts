import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationTasksRepositoryPG} from "../../organization_tasks_repository/org_tasks_repo_realization.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {ChangeOrgTaskTitleUseCase} from "../../application/change_org_task_title_use_case.js";
import {ChangeTitleWithAudit} from "../../application/service/change_title_with_audit.js";
import {ChangeTitleDTO} from "../../DTO/change_title_dto.js";


export class ChangeTitleServ {
    constructor(private readonly txManager: TransactionManager) {}

    changeTitleS = async (dto: ChangeTitleDTO) => {
        return await this.txManager.runInTransaction(async (client) => {
            const taskRepo = new OrganizationTasksRepositoryPG(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const auditEvents = new AuditEventsRepositoryPg(client);

            const auditEventsProxy = new AppendLogAuditEvents(auditEvents);
            const taskTitleUC = new ChangeOrgTaskTitleUseCase(taskRepo, orgMemberRepo);

            const changeTitleProxy = new ChangeTitleWithAudit(taskTitleUC, auditEventsProxy);

            return await changeTitleProxy.executeTx(dto);
        })
    }
}