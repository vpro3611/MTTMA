import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {OrganizationRepositoryPG} from "../../repository_realization/organization_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {ViewOrganizationUseCase} from "../../application/view_organization_use_case.js";
import {ViewOrganizationServiceWithAudit} from "../../application/service/view_organization_service_with_audit.js";


export class ViewOrganizationServ {
    constructor(private readonly txManager: TransactionManager) {}


    viewOrganizationS = async (actorId: string, orgId: string) => {
        return await this.txManager.runInTransaction(async (client) => {
            const userRepo = new UserRepositoryPG(client);
            const orgRepo = new OrganizationRepositoryPG(client);

            const auditEventRepo = new AuditEventsRepositoryPg(client);
            const writeAuditEvents = new AppendLogAuditEvents(auditEventRepo);

            const viewOrgUC = new ViewOrganizationUseCase(orgRepo, userRepo);

            const viewOrgProxy = new ViewOrganizationServiceWithAudit(viewOrgUC, writeAuditEvents);

            return await viewOrgProxy.executeTx(actorId, orgId);
        })
    }
}