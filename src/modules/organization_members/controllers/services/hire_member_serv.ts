import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {HireOrgMemberUseCase} from "../../application/hire_org_member_use_case.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {HireMemberWithAuditUseCase} from "../../application/services/hire_member_with_audit_use_case.js";
import {OrgMemsRole} from "../../domain/org_members_role.js";


export class HireMemberServ {
    constructor(private readonly txManager: TransactionManager) {}

    hireMemberS = async (hireMemberDto: {
        actorUserId: string,
        organizationId: string,
        targetUserId: string,
        role?: OrgMemsRole,
    }) => {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemRepo = new OrganizationMemberRepositoryPG(client);
            const userRepo = new UserRepositoryPG(client);
            const auditRepo = new AuditEventsRepositoryPg(client);
            const writeAudit = new AppendLogAuditEvents(auditRepo);

            const hireMemberUC = new HireOrgMemberUseCase(orgMemRepo, userRepo);

            const hireMemberProxy = new HireMemberWithAuditUseCase(hireMemberUC, writeAudit);

            return await hireMemberProxy.executeTx(hireMemberDto)
        })
    }
}