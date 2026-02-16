import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {ChangeStatusDTO} from "../../DTO/change_status_dto.js";
import {OrganizationTasksRepositoryPG} from "../../organization_tasks_repository/org_tasks_repo_realization.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {ChangeTaskStatusWithAudit} from "../../application/service/change_status_with_audit.js";
import {ChangeOrgTaskStatusUseCase} from "../../application/change_org_task_status_use_case.js";

export class ChangeStatusServ {
    constructor(private readonly txManager: TransactionManager) {}

    changeStatusS = async (dto: ChangeStatusDTO) => {
        return await this.txManager.runInTransaction(async (client) => {
          const taskRepo = new OrganizationTasksRepositoryPG(client);
          const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
          const auditEvents = new AuditEventsRepositoryPg(client);
          const auditEventsProxy = new AppendLogAuditEvents(auditEvents);
          const taskStatusUC = new ChangeOrgTaskStatusUseCase(taskRepo, orgMemberRepo);

          const changeStatusProxy = new ChangeTaskStatusWithAudit(taskStatusUC, auditEventsProxy);

          return await changeStatusProxy.executeTx(dto);
      })
    }
}