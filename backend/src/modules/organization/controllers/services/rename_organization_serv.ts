import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationRepositoryPG} from "../../repository_realization/organization_repository.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {RenameOrganizationUseCase} from "../../application/rename_organization_use_case.js";
import {RenameWithAudit} from "../../application/service/rename_with_audit.js";


export class RenameOrganizationServ {
    constructor(private readonly txManager : TransactionManager) {}

    renameOrgS = async (orgId: string, newName: string, actorId: string) => {
        return await this.txManager.runInTransaction(async (client) => {
            const orgRepo = new OrganizationRepositoryPG(client);
            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const auditRepo = new AuditEventsRepositoryPg(client);
            const auditWrite = new AppendLogAuditEvents(auditRepo);

            const renameOrgUC = new RenameOrganizationUseCase(orgRepo, orgMemberRepo);
            const renameOrgProxy = new RenameWithAudit(renameOrgUC, auditWrite);

            return await renameOrgProxy.executeTx(orgId, newName, actorId);
        })
    }
}