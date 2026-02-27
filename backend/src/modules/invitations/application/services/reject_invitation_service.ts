import {RejectInvitationUseCase} from "../reject_invitation_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class RejectInvitationService {
    constructor(private readonly rejectInvitation: RejectInvitationUseCase,
                private readonly auditWrite: AppendLogAuditEvents
    ) {}


    async executeTx(actorId: string, invitationId: string) {
        const rejected = await this.rejectInvitation.execute(actorId, invitationId);

        const audit = AuditEvent.create(
            actorId,
            rejected.organizationId,
            AuditEventActions.INVITATION_REJECTED,
        );

        await this.auditWrite.execute(audit);

        return rejected;
    }
}