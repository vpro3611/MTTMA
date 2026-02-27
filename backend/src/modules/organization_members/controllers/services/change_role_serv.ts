import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../organization_members_repository_realization/organization_member_repository.js";
import {ChangeOrgMemberRoleUseCase} from "../../application/change_role_org_member_use_case.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {ChangeRoleWithAuditUseCase} from "../../application/services/change_role_with_audit_use_case.js";


export class ChangeRoleServ {
    constructor(private readonly txManager: TransactionManager) {}

    changeRoleS = async (changeRoleDto: {
        actorUserId: string,
        organizationId: string,
        targetUserId: string,
        role: string,
    } ) => {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemRepo = new OrganizationMemberRepositoryPG(client);
            const auditRepo = new AuditEventsRepositoryPg(client);
            const writeAudit = new AppendLogAuditEvents(auditRepo);

            const changeRoleUC = new ChangeOrgMemberRoleUseCase(orgMemRepo);
            const changeRoleProxy = new ChangeRoleWithAuditUseCase(changeRoleUC, writeAudit);

            return await changeRoleProxy.executeTx(changeRoleDto);
        })
    }
}