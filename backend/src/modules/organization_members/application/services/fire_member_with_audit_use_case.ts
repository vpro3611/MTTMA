import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {FireOrgMemberUseCase} from "../fire_org_member_use_case.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";


export class FireMemberWithAuditUseCase {
    constructor(private readonly fireMemberUseCase: FireOrgMemberUseCase,
                private readonly auditUseCase: AppendLogAuditEvents
    ) {};

    async executeTx(dto: {
        actorUserId: string,
        organizationId: string,
        targetUserId: string,
    }) {
        const fired = await this.fireMemberUseCase.execute(
            dto.actorUserId,
            dto.organizationId,
            dto.targetUserId
        );

        const audit = AuditEvent.create(
            dto.actorUserId,
            dto.organizationId,
            AuditEventActions.ORG_MEMBER_FIRED
        );

        await this.auditUseCase.execute(audit);

        return fired;
    }
}