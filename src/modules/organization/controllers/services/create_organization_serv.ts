import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationRepositoryPG} from "../../repository_realization/organization_repository.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {CreateOrganizationUseCase} from "../../application/create_organization_use_case.js";
import {CreateOrganizationWithAudit} from "../../application/service/create_with_audit.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";

export class CreateOrgServ {
    constructor(private readonly txManager: TransactionManager) {}

    createOrgS = async (name: string, actorId: string) => {
        return await this.txManager.runInTransaction(async (client) => {
            const orgRepo = new OrganizationRepositoryPG(client);
            const userRepo = new UserRepositoryPG(client);

            const auditRepo = new AuditEventsRepositoryPg(client);
            const auditWrite = new AppendLogAuditEvents(auditRepo);

            const createTaskUC = new CreateOrganizationUseCase(orgRepo, userRepo);

            const createTaskProxy = new CreateOrganizationWithAudit(createTaskUC, auditWrite);

            return await createTaskProxy.executeTx(name, actorId);
        })
    }
}