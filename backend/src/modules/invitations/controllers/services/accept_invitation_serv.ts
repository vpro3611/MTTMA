import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {InvitationRepositoryPG} from "../../repository_realization/invitation_repository_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {AcceptInvitationUseCase} from "../../application/accept_invitation_use_case.js";
import {AcceptInvitationService} from "../../application/services/accept_invitation_service.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";


export class AcceptInvitationServ {
    constructor(private readonly txManager: TransactionManager) {}


    async acceptInvitationS(actorId: string, invitationId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const invitationRepoWrite = new InvitationRepositoryPG(client);
            const memberRepo = new OrganizationMemberRepositoryPG(client);
            const userRepo = new UserRepositoryPG(client);

            const auditEventsRepo = new AuditEventsRepositoryPg(client);
            const writeAuditEvents = new AppendLogAuditEvents(auditEventsRepo);

            const acceptInvUC = new AcceptInvitationUseCase(invitationRepoWrite, memberRepo, userRepo);
            const acceptInvProxy = new AcceptInvitationService(acceptInvUC, writeAuditEvents);

            return await acceptInvProxy.executeTx(actorId, invitationId);
        })
    }


}