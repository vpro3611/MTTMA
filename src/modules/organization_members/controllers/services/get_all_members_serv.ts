import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {GetAllMembersUseCase} from "../../application/get_all_members_use_case.js";
import {GetAllMembersWithAudit} from "../../application/services/get_all_members_with_audit.js";


export class GetAllMembersServ {
    constructor(private readonly txManager: TransactionManager) {}

    async getAllMembersS (actorId: string, orgId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const orgMemRepo = new OrganizationMemberRepositoryPG(client);
            const auditEventsRepo = new AuditEventsRepositoryPg(client);

            const writeAudit = new AppendLogAuditEvents(auditEventsRepo);
            const getAllMembersUC = new GetAllMembersUseCase(orgMemRepo);

            const getAllMembersProxy = new GetAllMembersWithAudit(getAllMembersUC, writeAudit);

            return await getAllMembersProxy.executeTx(actorId, orgId);
        })
    }
}