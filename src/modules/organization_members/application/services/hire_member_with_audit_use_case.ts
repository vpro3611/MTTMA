import {HireOrgMemberUseCase} from "../hire_org_member_use_case.js";
import {AppendLogAuditEvents} from "../../../audit_events/application/append_log_audit_events.js";
import {OrgMemsRole} from "../../domain/org_members_role.js";
import {AuditEventActions} from "../../../audit_events/domain/audit_event_actions.js";
import {AuditEvent} from "../../../audit_events/domain/audit_event_domain.js";


export class HireMemberWithAuditUseCase {
    constructor(
        private readonly hireUseCase: HireOrgMemberUseCase,
        private readonly auditUseCase: AppendLogAuditEvents,
    ) {};

    async executeTx(dto: {
        actorUserId: string,
        organizationId: string,
        targetUserId: string,
        role?: OrgMemsRole,
    }) {
        const hired = await this.hireUseCase.execute(
            dto.actorUserId,
            dto.organizationId,
            dto.targetUserId,
            dto.role,
        );

        const audit: AuditEvent = AuditEvent.create(dto.actorUserId, dto.organizationId, AuditEventActions.ORG_MEMBER_HIRED);

        await this.auditUseCase.execute(audit);

        return hired;
    }
}