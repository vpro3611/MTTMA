import {CreateInvitationUseCase} from "../create_invitation_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {OrgMemsRole} from "../../../organization_members/domain/org_members_role.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class CreateInvitationService {
    constructor(private readonly createInvitation: CreateInvitationUseCase,
                private readonly auditEvents: AppendLogAuditEvents) {}

    async executeTx(dto: {
        organizationId: string,
        invitedUserId: string,
        actorId: string,
        role?: OrgMemsRole,
    }) {
        const created = await this.createInvitation.execute(dto)

        const audit = AuditEvent.create(
            dto.actorId,
            dto.organizationId,
            AuditEventActions.INVITATION_CREATED,
        );

        await this.auditEvents.execute(audit);

        return created;
    }
}