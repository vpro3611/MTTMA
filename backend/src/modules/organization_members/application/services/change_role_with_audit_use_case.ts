import {ChangeOrgMemberRoleUseCase} from "../change_role_org_member_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class ChangeRoleWithAuditUseCase {
    constructor(
        private readonly alterMemberRole: ChangeOrgMemberRoleUseCase,
        private readonly auditEventUseCase: AppendLogAuditEvents,
    ) {};

    executeTx = async (dto: {
        actorUserId: string,
        organizationId: string,
        targetUserId: string,
        role: string,
    }) => {
        const changedRole = await this.alterMemberRole.execute(
            dto.actorUserId,
            dto.targetUserId,
            dto.organizationId,
            dto.role
        );

        const auditEvent = AuditEvent.create(
            dto.actorUserId,
            dto.organizationId,
            AuditEventActions.ORG_MEMBER_ROLE_CHANGED
        );

        await this.auditEventUseCase.execute(auditEvent);

        return changedRole;
    }
}