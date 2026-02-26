import {TransactionManager} from "../../../transaction_manager/transaction_manager_pg.js";
import {InvitationRepositoryPG} from "../../repository_realization/invitation_repository_pg.js";
import {
    OrganizationMemberRepositoryPG
} from "../../../organization_members/organization_members_repository_realization/organization_member_repository.js";
import {AuditEventsRepositoryPg} from "../../../audit_events/repozitory_realization/audit_events_repository_pg.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {CancelInvitationUseCase} from "../../application/cancel_invitation_use_case.js";
import {CancelInvitationService} from "../../application/services/cancel_invitation_service.js";


export class CancelInvitationServ {
    constructor(private readonly txManager: TransactionManager) {}

    async cancelInvitationS(actorId: string, invitationId: string) {
        return await this.txManager.runInTransaction(async (client) => {
            const invitationRepoWrite = new InvitationRepositoryPG(client);
            const memberRepo = new OrganizationMemberRepositoryPG(client);

            const auditEventsRepo = new AuditEventsRepositoryPg(client);
            const writeAuditEvents = new AppendLogAuditEvents(auditEventsRepo);

            const cancelInvUC = new CancelInvitationUseCase(invitationRepoWrite, memberRepo);
            const cancelInvProxy = new CancelInvitationService(cancelInvUC, writeAuditEvents);

            return await cancelInvProxy.executeTx(actorId, invitationId);
        });
    }
}