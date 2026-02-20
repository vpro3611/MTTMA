import {CancelInvitationUseCase} from "../cancel_invitation_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class CancelInvitationService {
    constructor(private readonly cancelInvitationUseCase: CancelInvitationUseCase,
                private readonly auditWrite: AppendLogAuditEvents
    ) {}

    async executeTx(actorId: string, invitationId: string) {
        const cancelled = await this.cancelInvitationUseCase.execute(actorId, invitationId);

        const audit = AuditEvent.create(
            actorId,
            cancelled.organizationId,
            AuditEventActions.INVITATION_CANCELED
        );

        await this.auditWrite.execute(audit);

        return cancelled;
    }
}