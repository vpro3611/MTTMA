import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {AuditEventsRepositoryPg} from "../../repozitory_realization/audit_events_repository_pg.js";
import {GetOrganizationAuditUseCase} from "../../application/get_org_audit_use_case.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AuditEventReaderPG} from "../../repozitory_realization/audit_event_reader.js";
import {GetAllAuditWithAudit} from "../../application/service/get_audit_byId_with_audit.js";
import {AppendLogAuditEvents} from "../../application/append_log_audit_events.js";


export class GetAuditByIdServ {
    constructor(private readonly txManager: TransactionManager) {}

    getAuditByOrgIdS = async (actorId: string, orgId: string) => {
        return await this.txManager.runInTransaction(async (client) => {
            const auditRepo = new AuditEventsRepositoryPg(client);
            const auditRepoReader = new AuditEventReaderPG(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const getAuditByIdUC = new GetOrganizationAuditUseCase(auditRepoReader, orgMemberRepo);

            const auditWrite = new AppendLogAuditEvents(auditRepo)

            const getByIdProxy = new GetAllAuditWithAudit(getAuditByIdUC, auditWrite);

            return await getByIdProxy.executeTx(actorId, orgId);
        })
    }
}