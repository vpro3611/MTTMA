import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {FireOrgMemberUseCase} from "../../application/fire_org_member_use_case.js";
import {FireMemberWithAuditUseCase} from "../../application/services/fire_member_with_audit_use_case.js";


export class FireMemberServ {
    constructor(private readonly txManager: TransactionManager) {}

    fireMemberS = async (dto: {
        actorUserId: string,
        organizationId: string,
        targetUserId: string
    }) => {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemRepo = new OrganizationMemberRepositoryPG(client);
            const auditRepo = new AuditEventsRepositoryPg(client);
            const writeAudit = new AppendLogAuditEvents(auditRepo);

            const fireMemberUC = new FireOrgMemberUseCase(orgMemRepo);
            const fireMemberProxy = new FireMemberWithAuditUseCase(fireMemberUC, writeAudit);

            return await fireMemberProxy.executeTx(dto);
        })
    }
}