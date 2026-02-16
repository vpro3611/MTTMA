import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {ChangeDescDTO} from "../../DTO/change_desc_dto.js";
import {ChangeDescWithAudit} from "../../application/service/change_desc_with_audit.js";
import {ChangeOrgTaskDescriptionUseCase} from "../../application/change_org_task_description_use_case.js";
import {OrganizationTasksRepositoryPG} from "../../organization_tasks_repository/org_tasks_repo_realization.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";


export class ChangeDescServ {
    constructor(private readonly txManager: TransactionManager) {}

    changeDescS = async (dto: ChangeDescDTO) => {
        return await this.txManager.runInTransaction(async (client) => {
            const taskRepo = new OrganizationTasksRepositoryPG(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const auditEvents = new AuditEventsRepositoryPg(client);
            const auditEventsProxy = new AppendLogAuditEvents(auditEvents);
            const taskDescUC = new ChangeOrgTaskDescriptionUseCase(taskRepo, orgMemberRepo)

            const changeDescProxy = new ChangeDescWithAudit(taskDescUC, auditEventsProxy);
            return await changeDescProxy.executeTx(dto);
        });
    };
}