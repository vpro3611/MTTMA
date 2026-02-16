import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {AuditEventsRepositoryPg} from "../../repozitory_realization/audit_events_repository_pg.js";
import {AuditEventReaderPG} from "../../repozitory_realization/audit_event_reader.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AppendLogAuditEvents} from "../../application/append_log_audit_events.js";
import {GetFilteredAuditOrgUseCase} from "../../application/get_filtered_audit_org_use_case.js";
import {GetFilterAuditWithAudit} from "../../application/service/get_filter_audit_with_audit.js";
import {GetAuditEventQuery} from "../../DTO/get_audit_event_query.js";


export class GetFilteredAuditServ {
    constructor(private readonly txManager: TransactionManager) {}

    getFilteredAuditS = async (queryDto: GetAuditEventQuery) => {
        return await this.txManager.runInTransaction(async (client) => {
            const auditRepo = new AuditEventsRepositoryPg(client);
            const auditRepoReader = new AuditEventReaderPG(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);

            const getFilteredAudit = new GetFilteredAuditOrgUseCase(auditRepoReader, orgMemberRepo);

            const auditWrite = new AppendLogAuditEvents(auditRepo)

            const getFilteredProxy = new GetFilterAuditWithAudit(getFilteredAudit, auditWrite);

            return await getFilteredProxy.executeTx(queryDto);
        })
    }
}