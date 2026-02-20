import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {InvitationRepositoryPG} from "../../repository_realization/invitation_repository_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {UserRepositoryPG} from "../../../user/repository_realization/user_repository_pg.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {RejectInvitationUseCase} from "../../application/reject_invitation_use_case.js";
import {RejectInvitationService} from "../../application/services/reject_invitation_service.js";


export class RejectInvitationServ {
    constructor(private readonly txManager: TransactionManager) {}


    async rejectInvitationS(actorId: string, invitationId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const invitationRepoWrite = new InvitationRepositoryPG(client);
            const memberRepo = new OrganizationMemberRepositoryPG(client);
            const userRepo = new UserRepositoryPG(client);

            const auditEventsRepo = new AuditEventsRepositoryPg(client);
            const writeAuditEvents = new AppendLogAuditEvents(auditEventsRepo);

            const rejectInvUC = new RejectInvitationUseCase(invitationRepoWrite, memberRepo, userRepo);
            const rejectInvProxy = new RejectInvitationService(rejectInvUC, writeAuditEvents);

            return await rejectInvProxy.executeTx(actorId, invitationId);
        })
    }
}