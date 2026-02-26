import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {OrganizationRepositoryPG} from "../../repository_realization/organization_repository.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {CreateOrganizationUseCase} from "../../application/create_organization_use_case.js";
import {CreateOrganizationWithAudit} from "../../application/service/create_with_audit.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {OrganizationMemberRepositoryPG} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {OrganizationMember} from "../../../organization_members/domain/organization_member_domain.js";
import {OrgMemsRole} from "../../../organization_members/domain/org_members_role.js";

export class CreateOrgServ {
    constructor(private readonly txManager: TransactionManager) {}

    async createOrgS (name: string, actorId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const orgRepo = new OrganizationRepositoryPG(client);
            const userRepo = new UserRepositoryPG(client);

            const auditRepo = new AuditEventsRepositoryPg(client);
            const auditWrite = new AppendLogAuditEvents(auditRepo);

            const createTaskUC = new CreateOrganizationUseCase(orgRepo, userRepo);

            const createTaskProxy = new CreateOrganizationWithAudit(createTaskUC, auditWrite);

            const organization = await createTaskProxy.executeTx(name, actorId);

            const orgMemberRepo = new OrganizationMemberRepositoryPG(client);
            const ownerMember = OrganizationMember.hire(organization.id, actorId, OrgMemsRole.OWNER);
            await orgMemberRepo.save(ownerMember);

            return organization;
        })
    }
}