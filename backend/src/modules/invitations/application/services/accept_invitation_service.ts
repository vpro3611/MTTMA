import {AcceptInvitationUseCase} from "../accept_invitation_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class AcceptInvitationService {
    constructor(private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
                private readonly writeAuditEvents: AppendLogAuditEvents
    ) {}

    async executeTx(actorId: string, invitationId: string) {

        const accepted = await this.acceptInvitationUseCase.execute(actorId, invitationId);

        const audit = AuditEvent.create(
            actorId,
            accepted.organizationId,
            AuditEventActions.INVITATION_ACCEPTED
        );
        await this.writeAuditEvents.execute(audit);

        return accepted;
    }
}