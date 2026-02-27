import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {Filters} from "../../DTO/filters.js";
import {InvitationRepositoryPG} from "../../repository_realization/invitation_repository_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {GetOrganizationInvitationUseCase} from "../../application/get_organization_invitation_use_case.js";
import {GetOrganizationInvitationsService} from "../../application/services/get_organization_invitations_service.js";


export class GetOrganizationInvitationsServ {
    constructor(private readonly txManager: TransactionManager) {}


    async getOrganizationInvitationsS(actorId: string, orgId: string, filters: Filters) {
        return await this.txManager.runInTransaction(async (client) => {
            const invitationRepoWrite = new InvitationRepositoryPG(client);
            const memberRepo = new OrganizationMemberRepositoryPG(client);

            const auditEventsRepo = new AuditEventsRepositoryPg(client);

            const getOrgInvUC = new GetOrganizationInvitationUseCase(memberRepo, invitationRepoWrite);
            const getOrgInvProxy = new GetOrganizationInvitationsService(getOrgInvUC);

            return await getOrgInvProxy.executeTx(actorId, orgId, filters);
        })
    }
}